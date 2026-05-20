import { defineField, defineType } from 'sanity'

const imageAsset = defineType({
  name: 'imageAsset',
  title: 'Image',
  type: 'document',
  fields: [
    defineField({
      name: 'image',
      title: 'Image File',
      type: 'image',
      options: {
        hotspot: true,
        metadata: ['blurhash', 'lqip', 'palette', 'exif']
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'caption',
      title: 'Caption / Title',
      type: 'object',
      fields: [
        { name: 'en', type: 'string', title: 'English' },
        { name: 'es', type: 'string', title: 'Spanish' }
      ]
    }),
    defineField({
      name: 'medium',
      title: 'Medium',
      type: 'string',
      options: {
        list: [
          { title: 'Film - Black & White', value: 'film-bw' },
          { title: 'Film - Color', value: 'film-color' },
          { title: 'Digital - Black & White', value: 'digital-bw' },
          { title: 'Digital - Color', value: 'digital-color' }
        ]
      },
      initialValue: 'film-bw',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'filmFormat',
      title: 'Film Format',
      type: 'string',
      options: {
        list: [
          { title: '35mm', value: '35mm' },
          { title: 'Medium Format (120)', value: '120' },
          { title: 'N/A (Digital)', value: 'none' }
        ]
      },
      hidden: ({ parent }) => parent?.medium?.startsWith('digital'),
      initialValue: '35mm'
    }),
    defineField({
      name: 'date',
      title: 'Date Taken',
      type: 'date',
      description: 'Optional. Use the precision selector to choose how much detail to display.',
      options: { dateFormat: 'YYYY-MM-DD' }
    }),
    defineField({
      name: 'datePrecision',
      title: 'Date Precision',
      type: 'string',
      description: 'How much of the date should be shown when displayed on the site.',
      options: {
        list: [
          { title: 'Exact date (Jan 15, 2024)', value: 'day' },
          { title: 'Month & year (Jan 2024)', value: 'month' },
          { title: 'Year only (2024)', value: 'year' }
        ],
        layout: 'radio'
      },
      initialValue: 'day',
      hidden: ({ parent }) => !parent?.date
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured (Homepage)',
      type: 'boolean',
      description: 'Show in homepage hero masonry',
      initialValue: false
    }),
    defineField({
      name: 'project',
      title: 'Project',
      type: 'reference',
      to: [{ type: 'project' }],
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags'
      },
      description: 'For filtering and organization'
    }),
    defineField({
      name: 'availableAsPrint',
      title: 'Available as Print',
      type: 'boolean',
      initialValue: false
    }),
    defineField({
      name: 'printProduct',
      title: 'Related Print Product',
      type: 'reference',
      to: [{ type: 'product' }],
      hidden: ({ parent }) => !parent?.availableAsPrint
    }),
    defineField({
      name: 'order',
      title: 'Order in Project',
      type: 'number',
      description: 'Sequence within the project gallery'
    })
  ],
  orderings: [
    {
      title: 'Caption (A–Z)',
      name: 'captionAsc',
      by: [{ field: 'caption.en', direction: 'asc' }]
    },
    {
      title: 'Caption (Z–A)',
      name: 'captionDesc',
      by: [{ field: 'caption.en', direction: 'desc' }]
    },
    {
      title: 'Date (newest first)',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }]
    },
    {
      title: 'Date (oldest first)',
      name: 'dateAsc',
      by: [{ field: 'date', direction: 'asc' }]
    },
    {
      title: 'Order in project',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }]
    }
  ],
  preview: {
    select: {
      media: 'image',
      caption: 'caption.en',
      project: 'project.title.en'
    },
    prepare({ media, caption, project }) {
      return {
        title: caption || 'Untitled',
        subtitle: project,
        media: media
      }
    }
  }
})

export default imageAsset
