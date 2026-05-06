#!/usr/bin/env node
/**
 * Reads markdown from stdin, prints a Portable Text block array (JSON)
 * to stdout. Used as a one-off helper to convert legal-page markdown
 * into rich-text blocks via the Sanity MCP, without needing the
 * SANITY_API_TOKEN locally.
 */
import { marked } from 'marked'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'

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
        if (spans.length === before) spans.push({ _type: 'span', _key: randomUUID(), text: t.text ?? t.href, marks: [...marks, linkKey] })
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
      const inner = (t.tokens ?? [])
        .filter((x) => x.type === 'paragraph')
        .flatMap((p) => p.tokens)
      blocks.push(buildBlock('blockquote', inner))
    } else if (t.type === 'list') {
      const listItem = t.ordered ? 'number' : 'bullet'
      for (const item of t.items) {
        const inner = (item.tokens ?? [])
          .flatMap((x) =>
            x.type === 'paragraph'
              ? x.tokens
              : x.tokens
              ? x.tokens
              : [{ type: 'text', text: x.text, raw: x.text }],
          )
        blocks.push(buildBlock('normal', inner, listItem))
      }
    } else if (t.type === 'space' || t.type === 'hr' || t.type === 'html') {
      /* skip */
    }
  }
  return blocks
}

const md = readFileSync(0, 'utf8')
const tokens = marked.lexer(md)
process.stdout.write(JSON.stringify(tokensToBlocks(tokens)))
