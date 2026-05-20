import type { StructureBuilder, StructureResolver } from 'sanity/structure'

/**
 * Custom Studio sidebar.
 *
 * Projects expand into a per-project view: clicking a project shows a
 * "Browse" link to edit the project document plus an "Images in this project"
 * list filtered to imageAssets that reference it.
 *
 * Other doc types use the default flat list (sorted alphabetically by default
 * — see schema `orderings`).
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Projects')
        .schemaType('project')
        .child(
          S.documentTypeList('project')
            .title('Projects')
            .child((projectId) => projectChildList(S, projectId))
        ),
      S.divider(),
      S.documentTypeListItem('imageAsset').title('All Images'),
      S.documentTypeListItem('location').title('Locations'),
      S.documentTypeListItem('product').title('Products'),
      S.divider(),
      S.listItem()
        .title('Site Settings')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
        ),
    ])

function projectChildList(S: StructureBuilder, projectId: string) {
  return S.list()
    .title('Project')
    .items([
      S.listItem()
        .title('Edit project')
        .child(S.document().schemaType('project').documentId(projectId)),
      S.listItem()
        .title('Images in this project')
        .child(
          S.documentList()
            .title('Images')
            .schemaType('imageAsset')
            .filter('_type == "imageAsset" && project._ref == $projectId')
            .params({ projectId })
            .defaultOrdering([{ field: 'order', direction: 'asc' }])
        ),
    ])
}
