#!/usr/bin/env node
/**
 * Convert each legalPage's existing markdown content into Portable Text
 * blocks and write them to the `body` field. Reads from `legacyMarkdown`
 * if present (post-migration), otherwise reads from the still-string
 * `body` field directly. Idempotent — re-running on a doc whose body is
 * already an array is a no-op.
 *
 * Usage:
 *   node scripts/convert-legal-md-to-rich.mjs                       # both datasets, dry run
 *   node scripts/convert-legal-md-to-rich.mjs --apply               # both datasets, real
 *   node scripts/convert-legal-md-to-rich.mjs --dataset=staging --apply
 */

import { createClient } from '@sanity/client'
import { config as loadEnv } from 'dotenv'
import { marked } from 'marked'
import { randomUUID } from 'node:crypto'
import process from 'node:process'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const token = process.env.SANITY_API_TOKEN
if (!projectId || !token) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN in env')
  process.exit(1)
}

const args = new Set(process.argv.slice(2))
const apply = args.has('--apply')
const datasetArg = [...args].find((a) => a.startsWith('--dataset='))
const datasets = datasetArg ? [datasetArg.split('=')[1]] : ['staging', 'production']

/* ── markdown → Portable Text ────────────────────────────────── */

const STYLE_BY_DEPTH = { 2: 'h2', 3: 'h3', 4: 'h4' }

function inlineToSpans(tokens) {
  const spans = []
  const walk = (toks, marks = []) => {
    for (const t of toks) {
      if (t.type === 'text' && t.tokens) {
        walk(t.tokens, marks)
      } else if (t.type === 'text' || t.type === 'escape') {
        spans.push({ _type: 'span', _key: randomUUID(), text: t.text, marks: [...marks] })
      } else if (t.type === 'strong') {
        walk(t.tokens, [...marks, 'strong'])
      } else if (t.type === 'em') {
        walk(t.tokens, [...marks, 'em'])
      } else if (t.type === 'codespan') {
        spans.push({ _type: 'span', _key: randomUUID(), text: t.text, marks: [...marks, 'code'] })
      } else if (t.type === 'del') {
        walk(t.tokens, [...marks, 'strike-through'])
      } else if (t.type === 'link') {
        const linkKey = randomUUID()
        spans.push({
          _type: 'span',
          _key: randomUUID(),
          text: t.text,
          marks: [...marks, linkKey],
          /* annotation reference handled at block level via markDefs */
          __annotation: { _key: linkKey, _type: 'link', href: t.href, newTab: /^https?:/.test(t.href) },
        })
      } else if (t.type === 'br') {
        spans.push({ _type: 'span', _key: randomUUID(), text: '\n', marks: [...marks] })
      } else {
        /* Unknown inline — render as plain text fallback */
        spans.push({ _type: 'span', _key: randomUUID(), text: t.raw ?? t.text ?? '', marks: [...marks] })
      }
    }
  }
  walk(tokens)
  return spans
}

function buildBlock(style, tokens, listItem = null) {
  const spans = inlineToSpans(tokens)
  const markDefs = []
  for (const s of spans) {
    if (s.__annotation) {
      markDefs.push(s.__annotation)
      delete s.__annotation
    }
  }
  const block = {
    _type: 'block',
    _key: randomUUID(),
    style,
    markDefs,
    children: spans.length ? spans : [{ _type: 'span', _key: randomUUID(), text: '', marks: [] }],
  }
  if (listItem) {
    block.listItem = listItem
    block.level = 1
  }
  return block
}

function tokensToBlocks(tokens) {
  const blocks = []
  for (const t of tokens) {
    if (t.type === 'heading') {
      const style = STYLE_BY_DEPTH[t.depth] ?? 'normal'
      blocks.push(buildBlock(style, t.tokens))
    } else if (t.type === 'paragraph') {
      blocks.push(buildBlock('normal', t.tokens))
    } else if (t.type === 'blockquote') {
      /* Flatten blockquote contents into a single quote block. Sanity's
         block content doesn't nest, so we lose paragraph breaks inside
         a quote — acceptable for our policy text. */
      const inner = t.tokens
        .filter((x) => x.type === 'paragraph')
        .flatMap((p) => p.tokens)
      blocks.push(buildBlock('blockquote', inner))
    } else if (t.type === 'list') {
      const listItem = t.ordered ? 'number' : 'bullet'
      for (const item of t.items) {
        const itemTokens = (item.tokens ?? []).filter(
          (x) => x.type === 'text' || x.type === 'paragraph',
        )
        const inner = itemTokens.flatMap((x) =>
          x.type === 'paragraph' ? x.tokens : x.tokens ?? [{ type: 'text', text: x.text, raw: x.text }],
        )
        blocks.push(buildBlock('normal', inner, listItem))
      }
    } else if (t.type === 'space' || t.type === 'hr') {
      /* skip — Sanity has no horizontal-rule equivalent in PT */
    } else if (t.type === 'html') {
      /* fallback to plain text */
      blocks.push(buildBlock('normal', [{ type: 'text', text: t.raw, raw: t.raw }]))
    }
  }
  return blocks
}

function markdownToBlocks(md) {
  const tokens = marked.lexer(md)
  return tokensToBlocks(tokens)
}

/* ── Driver ──────────────────────────────────────────────────── */

async function convert(dataset) {
  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2024-09-01',
    token,
    useCdn: false,
  })

  const docs = await client.fetch(
    `*[_type == "legalPage"]{_id, title, body, legacyMarkdown}`,
  )

  for (const d of docs) {
    /* Already converted? body is an array of blocks. */
    if (Array.isArray(d.body) && d.body.length && d.body[0]?._type === 'block') {
      console.log(`  - ${d._id} already rich text, skipping`)
      continue
    }
    const md = d.legacyMarkdown ?? (typeof d.body === 'string' ? d.body : '')
    if (!md.trim()) {
      console.log(`  - ${d._id} no markdown to convert`)
      continue
    }
    const blocks = markdownToBlocks(md)
    console.log(`  - ${d._id} ("${d.title}") → ${blocks.length} blocks`)

    if (apply) {
      /* If body is currently a string (pre-migration), unset it before
         setting the array, otherwise the patch fails on type mismatch. */
      const patch = client.patch(d._id)
      if (typeof d.body === 'string') patch.unset(['body'])
      await patch.set({ body: blocks }).commit()
      console.log(`    ✓ written`)
    }
  }
}

for (const ds of datasets) {
  console.log(`\n━━━ ${ds} ━━━`)
  await convert(ds)
}
console.log(`\n${apply ? 'Done.' : 'Dry run only — re-run with --apply to write.'}`)
