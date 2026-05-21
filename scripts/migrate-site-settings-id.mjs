/**
 * One-shot migration: ensure the singleton `siteSettings` document lives at
 * `_id === 'siteSettings'` so the Studio's singleton tile opens the real
 * document instead of a phantom empty one.
 *
 * What it does:
 *   1. Fetches every `siteSettings` document.
 *   2. If a doc already has `_id === 'siteSettings'`, nothing to do.
 *   3. Otherwise picks the most-recently-updated one, copies every field
 *      into a new document at `_id: 'siteSettings'`, and deletes the
 *      original. Drafts are migrated too.
 *
 * Aborts (without writing) if anything looks ambiguous so you can resolve
 * manually before re-running.
 *
 * Usage:
 *   node --env-file=.env.local scripts/migrate-site-settings-id.mjs          # dry run
 *   node --env-file=.env.local scripts/migrate-site-settings-id.mjs --commit # apply
 */

import { createClient } from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN

if (!projectId) throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
if (!token) throw new Error('Missing SANITY_API_TOKEN (needs write access)')

const commit = process.argv.includes('--commit')

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

const TARGET_ID = 'siteSettings'
const DRAFT_ID = `drafts.${TARGET_ID}`

const all = await client.fetch(
  `*[_type == "siteSettings"]{ ..., _id, _rev, _updatedAt }`
)

if (all.length === 0) {
  console.log('No siteSettings documents found. Nothing to do.')
  process.exit(0)
}

const published = all.filter((d) => !d._id.startsWith('drafts.'))
const drafts = all.filter((d) => d._id.startsWith('drafts.'))

console.log(`Found ${all.length} siteSettings document(s):`)
for (const d of all) console.log(`  ${d._id}  (updated ${d._updatedAt})`)

const alreadyAtTarget = published.find((d) => d._id === TARGET_ID)
if (alreadyAtTarget && published.length === 1) {
  console.log(`\nAlready at _id='${TARGET_ID}'. Nothing to migrate.`)
  process.exit(0)
}

if (alreadyAtTarget && published.length > 1) {
  console.error(
    `\nAborting: doc at _id='${TARGET_ID}' AND ${published.length - 1} other published siteSettings doc(s) exist. ` +
    `Resolve manually so only one canonical version is left, then re-run.`
  )
  process.exit(1)
}

// Pick the most recently updated published doc as the source of truth.
const source = published.sort((a, b) =>
  b._updatedAt.localeCompare(a._updatedAt)
)[0]
if (!source) {
  console.error('\nAborting: no published siteSettings document to migrate from.')
  process.exit(1)
}

console.log(`\nWill migrate: ${source._id}  ⇒  ${TARGET_ID}`)
if (drafts.length > 0) {
  console.log(`Will also delete ${drafts.length} draft(s): ${drafts.map((d) => d._id).join(', ')}`)
}

// Build the new doc by stripping system fields from the source and pinning
// the new _id. Keep _type; let Sanity assign a fresh _rev/_createdAt/_updatedAt.
const { _id: _oldId, _rev: _oldRev, _createdAt: _oldCreated, _updatedAt: _oldUpdated, ...sourceFields } = source
const newDoc = { ...sourceFields, _id: TARGET_ID }

if (!commit) {
  console.log('\nDry run. New document preview:')
  console.log(JSON.stringify(newDoc, null, 2).slice(0, 500) + (JSON.stringify(newDoc).length > 500 ? '…' : ''))
  console.log('\nRe-run with --commit to apply.')
  process.exit(0)
}

console.log('\nApplying...')
const tx = client.transaction()
tx.createIfNotExists(newDoc)
// Replace (in case createIfNotExists was a no-op because the target ID
// existed without our changes — won't happen given the guard above, but
// defensive).
tx.createOrReplace(newDoc)
// Remove the old published doc and any drafts of either id.
tx.delete(source._id)
for (const d of drafts) tx.delete(d._id)
// Belt-and-braces: also clear any draft of the new target ID in case one
// got created from clicking the empty studio tile earlier.
tx.delete(DRAFT_ID)

const result = await tx.commit()
console.log(`Done. Mutated ${result.results.length} documents.`)
console.log(`Refresh the Studio — Site Settings should now open your existing content.`)
