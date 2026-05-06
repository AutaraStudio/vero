/**
 * Audit every document in Sanity for orphan top-level fields — values
 * that exist in the data but no longer appear in the schema. Reads the
 * current schema definitions from `../src/sanity/schemaTypes/index.ts`
 * so it stays accurate as schemas change.
 *
 *   npx sanity exec scripts/sanity-exec-audit-orphan-fields.ts --with-user-token
 *
 * Reports only — never writes. A separate companion script will unset
 * fields once the report has been reviewed.
 */
import { getCliClient } from 'sanity/cli'
import { schema } from '../src/sanity/schemaTypes'

const client = getCliClient({ apiVersion: '2024-09-01' })
console.log(`Dataset: ${client.config().dataset}\n`)

/* Built-in fields Sanity adds to every doc — never report these. */
const SYSTEM_FIELDS = new Set([
  '_id', '_type', '_rev', '_createdAt', '_updatedAt',
  '_system', '_originalId', '_translations',
])

/* Build a set of known top-level field names per doc type from the
   schema definitions. Reusable object types (e.g. seoFields, mediaBlock)
   are skipped — they're nested inside parent docs, not top-level docs. */
type FieldDef = { name?: string }
type SchemaTypeDef = { name?: string; type?: string; fields?: FieldDef[] }
const knownFieldsByType = new Map<string, Set<string>>()
for (const t of schema.types as SchemaTypeDef[]) {
  if (t.type !== 'document' || !t.name) continue
  const names = new Set<string>(SYSTEM_FIELDS)
  for (const f of t.fields ?? []) {
    if (f?.name) names.add(f.name)
  }
  knownFieldsByType.set(t.name, names)
}

console.log(`Loaded ${knownFieldsByType.size} document type(s) from schema:\n  ${[...knownFieldsByType.keys()].join(', ')}\n`)

void (async () => {
  let totalOrphans = 0
  const docTypes = [...knownFieldsByType.keys()]

  for (const docType of docTypes) {
    const known = knownFieldsByType.get(docType)!
    /* Get all docs of this type. For singletons that's at most 1; for
       collections it could be many — fine, we report per-doc. */
    const docs = await client.fetch<Record<string, unknown>[]>(`*[_type == $t]`, { t: docType })

    for (const doc of docs) {
      const orphans = Object.keys(doc).filter((k) => !known.has(k))
      if (orphans.length === 0) continue
      totalOrphans += orphans.length
      console.log(`\n  [${docType}] ${doc._id ?? '?'}`)
      for (const k of orphans) {
        const value = doc[k]
        const summary = (() => {
          if (value === null) return 'null'
          if (Array.isArray(value)) return `array (${value.length} item${value.length === 1 ? '' : 's'})`
          if (typeof value === 'object') return 'object'
          if (typeof value === 'string') return `string ${JSON.stringify(value.slice(0, 60))}`
          return JSON.stringify(value)
        })()
        console.log(`    - ${k}: ${summary}`)
      }
    }
  }

  console.log(`\n${totalOrphans === 0 ? '✓ No orphan fields found.' : `Found ${totalOrphans} orphan field reference(s) total. Review and add to the cleanup script.`}`)
})()
