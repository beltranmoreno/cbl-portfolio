import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'
import { structure } from './sanity/structure'
import BulkUploadTool from './sanity/tools/BulkUploadTool'

export default defineConfig({
  name: 'default',
  title: 'Carmen Ballvé Portfolio',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',

  basePath: '/studio',

  plugins: [structureTool({ structure }), visionTool()],

  schema: {
    types: schemaTypes,
  },

  tools: (prev) => [
    ...prev,
    {
      name: 'bulk-upload',
      title: 'Bulk Upload',
      component: BulkUploadTool,
    },
  ],
})
