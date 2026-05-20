import { defineField, defineType } from 'sanity'

const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'object',
      validation: (Rule) => Rule.required(),
      fields: [
        { name: 'en', type: 'string', title: 'English' },
        { name: 'es', type: 'string', title: 'Spanish' }
      ]
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'object',
      fields: [
        {
          name: 'en',
          type: 'slug',
          title: 'English Slug',
          options: { source: 'title.en', maxLength: 96 }
        },
        {
          name: 'es',
          type: 'slug',
          title: 'Spanish Slug',
          options: { source: 'title.es', maxLength: 96 }
        }
      ]
    }),
    defineField({
      name: 'startYear',
      title: 'Start Year',
      type: 'number',
      description: 'Year the project started',
      validation: (Rule) => Rule.required().min(1900).max(new Date().getFullYear())
    }),
    defineField({
      name: 'endYear',
      title: 'End Year',
      type: 'number',
      description: 'Year the project ended (leave empty if ongoing)',
      validation: (Rule) => Rule.min(1900).max(new Date().getFullYear())
    }),
    defineField({
      name: 'isOngoing',
      title: 'Ongoing Project',
      type: 'boolean',
      description: 'Check if project is still ongoing (will display "Present")',
      initialValue: false
    }),
    defineField({
      name: 'locations',
      title: 'Locations',
      type: 'array',
      description: 'Where the project was made. References the Location document type.',
      of: [{ type: 'reference', to: [{ type: 'location' }] }]
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'object',
      fields: [
        {
          name: 'en',
          type: 'array',
          of: [{ type: 'block' }],
          title: 'English'
        },
        {
          name: 'es',
          type: 'array',
          of: [{ type: 'block' }],
          title: 'Spanish'
        }
      ]
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true,
        metadata: ['blurhash', 'lqip', 'palette']
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'primaryMedium',
      title: 'Primary Medium',
      type: 'string',
      options: {
        list: [
          { title: 'Film - Black & White', value: 'film-bw' },
          { title: 'Digital - Black & White', value: 'digital-bw' },
          { title: 'Mixed', value: 'mixed' }
        ]
      },
      initialValue: 'film-bw'
    }),
    defineField({
      name: 'collaborators',
      title: 'Collaborators',
      type: 'array',
      of: [{ type: 'string' }]
    }),
    defineField({
      name: 'publications',
      title: 'Publications',
      type: 'object',
      fields: [
        { name: 'en', type: 'array', of: [{ type: 'string' }], title: 'English' },
        { name: 'es', type: 'array', of: [{ type: 'string' }], title: 'Spanish' }
      ]
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured on Homepage',
      type: 'boolean',
      initialValue: false
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first'
    })
  ],
  orderings: [
    {
      title: 'Title (A–Z)',
      name: 'titleAsc',
      by: [{ field: 'title.en', direction: 'asc' }]
    },
    {
      title: 'Title (Z–A)',
      name: 'titleDesc',
      by: [{ field: 'title.en', direction: 'desc' }]
    },
    {
      title: 'Year (newest first)',
      name: 'yearDesc',
      by: [{ field: 'startYear', direction: 'desc' }]
    },
    {
      title: 'Display order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }]
    }
  ],
  preview: {
    select: {
      title: 'title.en',
      media: 'featuredImage',
      startYear: 'startYear',
      endYear: 'endYear',
      isOngoing: 'isOngoing'
    },
    prepare({ title, media, startYear, endYear, isOngoing }) {
      let yearDisplay = startYear?.toString() || ''
      if (isOngoing) {
        yearDisplay += ' - Present'
      } else if (endYear && endYear !== startYear) {
        yearDisplay += ` - ${endYear}`
      }

      return {
        title: title,
        subtitle: yearDisplay,
        media: media
      }
    }
  }
})

export default project
