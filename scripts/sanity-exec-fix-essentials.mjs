/**
 * Drop the trailing "s" from any "Essentials" reference in the contactPage
 * FAQ answers — the previous amends pass only matched "Essentials plan",
 * which missed the FAQ where the word appears without "plan" after it.
 *
 *   npx sanity exec scripts/sanity-exec-fix-essentials.mjs --with-user-token
 */
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-09-01' })
console.log(`Dataset: ${client.config().dataset}\n`)

const doc = await client.fetch(`*[_id == "contactPage"][0]{faqs}`)

let patch = client.patch('contactPage')
let changes = 0

for (const faq of doc?.faqs ?? []) {
  for (const block of faq.answer ?? []) {
    for (const child of block.children ?? []) {
      if (typeof child.text === 'string' && /\bEssentials\b/.test(child.text)) {
        const next = child.text.replace(/\bEssentials\b/g, 'Essential')
        const path = `faqs[_key=="${faq._key}"].answer[_key=="${block._key}"].children[_key=="${child._key}"].text`
        patch = patch.set({ [path]: next })
        changes++
        console.log(`  ✓ ${faq.question.slice(0, 50)}…`)
      }
    }
  }
}

if (changes) {
  await patch.commit()
  console.log(`\nWrote ${changes} change(s).`)
} else {
  console.log('\nNo "Essentials" references found.')
}
