/**
 * One-shot migration: convert `project.locations` (inline strings) into
 * references to `location` documents.
 *
 * Handles two source shapes seen in the wild:
 *   1. Original:     locations: ['Mexico City, Mexico', 'Oaxaca, Mexico']
 *   2. Intermediate: locations: { en: [...], es: [...] }
 *
 * Steps:
 *   1. Collect every unique English location string from all projects.
 *   2. For each unique string, create (or reuse) a `location` document with
 *      `name.en` set. `name.es` is left blank for you to translate manually
 *      in the Studio.
 *   3. Patch each project so `locations` becomes [{_type:'reference', _ref:'<id>'}].
 *
 * Usage:
 *   node --env-file=.env.local scripts/migrate-locations.mjs          # dry run
 *   node --env-file=.env.local scripts/migrate-locations.mjs --commit # apply
 *
 * Idempotent: existing Location docs are reused by EN name; projects whose
 * `locations` are already references are skipped.
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

function slugify(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 96)
}

/**
 * Pull the English name strings out of whatever shape `locations` is in.
 * Returns [] if the field is empty, already-references, or unrecognised.
 */
function extractEnStrings(loc) {
  if (!loc) return []
  if (Array.isArray(loc)) {
    if (loc.length === 0) return []
    // Could be string[] (old) or reference[] (new). Skip refs.
    if (typeof loc[0] === 'string') return loc.filter((s) => typeof s === 'string' && s.trim())
    if (loc[0] && typeof loc[0] === 'object' && '_ref' in loc[0]) return []
    return []
  }
  if (typeof loc === 'object' && Array.isArray(loc.en)) {
    return loc.en.filter((s) => typeof s === 'string' && s.trim())
  }
  return []
}

// 1. Fetch all projects and all existing locations
const [projects, existingLocations] = await Promise.all([
  client.fetch(`*[_type == "project"]{ _id, _rev, title, locations }`),
  client.fetch(`*[_type == "location"]{ _id, name }`),
])

// Map<lowercased EN name, location _id>
const enNameToId = new Map()
for (const loc of existingLocations) {
  const en = loc.name?.en
  if (en) enNameToId.set(en.toLowerCase().trim(), loc._id)
}

// 2. Collect unique EN names that don't have a Location doc yet
const allEnNames = new Set()
const projectsNeedingPatch = []

for (const proj of projects) {
  const enStrings = extractEnStrings(proj.locations)
  if (enStrings.length === 0) continue
  // Skip if already references (handled in extractEnStrings)
  enStrings.forEach((s) => allEnNames.add(s))
  projectsNeedingPatch.push({ proj, enStrings })
}

const newLocations = []
for (const en of allEnNames) {
  if (enNameToId.has(en.toLowerCase().trim())) continue
  const slug = slugify(en) || `loc-${Math.random().toString(36).slice(2, 8)}`
  newLocations.push({ en, slug })
}

console.log(`Found ${projects.length} project documents.`)
console.log(`  ${projectsNeedingPatch.length} projects need migration`)
console.log(`  ${existingLocations.length} existing Location documents`)
console.log(`  ${newLocations.length} new Location documents to create`)

if (newLocations.length > 0) {
  console.log('\nNew Location docs:')
  for (const loc of newLocations) {
    console.log(`  + ${loc.en}  (slug: ${loc.slug})`)
  }
}

if (projectsNeedingPatch.length > 0) {
  console.log('\nProject patches:')
  for (const { proj, enStrings } of projectsNeedingPatch) {
    const titleEn = proj.title?.en || '(untitled)'
    console.log(`  -> ${titleEn}: ${JSON.stringify(enStrings)}`)
  }
}

if (!commit) {
  console.log('\nDry run. Re-run with --commit to apply changes.')
  process.exit(0)
}

if (newLocations.length === 0 && projectsNeedingPatch.length === 0) {
  console.log('\nNothing to commit.')
  process.exit(0)
}

// 3. Create new Location docs in a transaction
if (newLocations.length > 0) {
  console.log('\nCreating Location documents...')
  const createTx = client.transaction()
  for (const loc of newLocations) {
    const doc = {
      _id: `location.${loc.slug}`,
      _type: 'location',
      name: { en: loc.en, es: '' },
      slug: {
        en: { _type: 'slug', current: loc.slug },
        es: { _type: 'slug', current: '' },
      },
    }
    createTx.createIfNotExists(doc)
    enNameToId.set(loc.en.toLowerCase().trim(), doc._id)
  }
  const createResult = await createTx.commit()
  console.log(`Created/upserted ${createResult.results.length} Location documents.`)
}

// 4. Patch projects to use references
console.log('\nPatching projects...')
const patchTx = client.transaction()
for (const { proj, enStrings } of projectsNeedingPatch) {
  const refs = enStrings
    .map((s) => enNameToId.get(s.toLowerCase().trim()))
    .filter(Boolean)
    .map((id) => ({ _type: 'reference', _ref: id, _key: id.replace(/[^a-zA-Z0-9]/g, '') }))

  patchTx.patch(proj._id, (p) =>
    p.set({ locations: refs }).ifRevisionId(proj._rev)
  )
}
const patchResult = await patchTx.commit()
console.log(`Patched ${patchResult.results.length} projects.`)
console.log('\nDone. Open the Sanity Studio to add Spanish translations to each Location.')
