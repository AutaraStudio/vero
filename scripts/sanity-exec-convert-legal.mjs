/**
 * Run with: npx sanity exec scripts/sanity-exec-convert-legal.mjs --with-user-token
 *
 * Uses the Sanity CLI's authenticated client (no separate API token
 * needed) to convert each legalPage's markdown body into Portable Text
 * blocks. Targets the dataset configured in sanity.config.ts. To run
 * against the other dataset, switch the `dataset` value in sanity.config
 * temporarily, or set NEXT_PUBLIC_SANITY_DATASET in env.
 */

import { getCliClient } from 'sanity/cli'
import { marked } from 'marked'
import { randomUUID } from 'node:crypto'

const STYLE_BY_DEPTH = { 2: 'h2', 3: 'h3', 4: 'h4' }

function inlineToSpans(tokens) {
  const spans = []
  const annotations = []
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
        annotations.push({ _key: linkKey, _type: 'link', href: t.href, newTab: /^https?:/.test(t.href) })
        const before = spans.length
        walk(t.tokens, [...marks, linkKey])
        if (spans.length === before)
          spans.push({ _type: 'span', _key: randomUUID(), text: t.text ?? t.href, marks: [...marks, linkKey] })
      } else if (t.type === 'br') {
        spans.push({ _type: 'span', _key: randomUUID(), text: '\n', marks: [...marks] })
      } else {
        spans.push({ _type: 'span', _key: randomUUID(), text: t.raw ?? t.text ?? '', marks: [...marks] })
      }
    }
  }
  walk(tokens)
  return { spans, annotations }
}

function buildBlock(style, tokens, listItem = null) {
  const { spans, annotations } = inlineToSpans(tokens)
  const block = {
    _type: 'block',
    _key: randomUUID(),
    style,
    markDefs: annotations,
    children: spans.length
      ? spans
      : [{ _type: 'span', _key: randomUUID(), text: '', marks: [] }],
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
      blocks.push(buildBlock(STYLE_BY_DEPTH[t.depth] ?? 'normal', t.tokens))
    } else if (t.type === 'paragraph') {
      blocks.push(buildBlock('normal', t.tokens))
    } else if (t.type === 'blockquote') {
      const inner = (t.tokens ?? [])
        .filter((x) => x.type === 'paragraph')
        .flatMap((p) => p.tokens)
      blocks.push(buildBlock('blockquote', inner))
    } else if (t.type === 'list') {
      const listItem = t.ordered ? 'number' : 'bullet'
      for (const item of t.items) {
        const inner = (item.tokens ?? []).flatMap((x) =>
          x.type === 'paragraph'
            ? x.tokens
            : x.tokens
            ? x.tokens
            : [{ type: 'text', text: x.text, raw: x.text }],
        )
        blocks.push(buildBlock('normal', inner, listItem))
      }
    }
  }
  return blocks
}

const apply = process.argv.includes('--apply')

const client = getCliClient({ apiVersion: '2024-09-01' })

const docs = await client.fetch(`*[_type == "legalPage"]{_id, title, body, legacyMarkdown}`)
console.log(`Dataset: ${client.config().dataset}\n`)

for (const d of docs) {
  if (Array.isArray(d.body) && d.body.length && d.body[0]?._type === 'block') {
    console.log(`  - ${d._id} already rich text, skipping`)
    continue
  }
  const md = d.legacyMarkdown ?? (typeof d.body === 'string' ? d.body : '')
  if (!md.trim()) {
    console.log(`  - ${d._id} no markdown to convert`)
    continue
  }
  const blocks = tokensToBlocks(marked.lexer(md))
  console.log(`  - ${d._id} ("${d.title}") → ${blocks.length} blocks`)

  if (apply) {
    /* If body is currently a string we have to unset first in a separate
       patch — Sanity applies unset+set together as a single mutation and
       unset wins on the same path, leaving the field undefined. */
    if (typeof d.body === 'string') {
      await client.patch(d._id).unset(['body']).commit()
    }
    await client.patch(d._id).set({ body: blocks }).commit()
    console.log(`    ✓ written`)
  }
}

if (!apply) console.log('\nDry run only — re-run with --apply to write.')
