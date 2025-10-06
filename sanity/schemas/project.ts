export default {
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'object',
      validation: (Rule: any) => Rule.required(),
      fields: [
        { name: 'en', type: 'string', title: 'English' },
        { name: 'es', type: 'string', title: 'Spanish' }
      ]
    },
    {
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
    },
    {
      name: 'startYear',
      title: 'Start Year',
      type: 'number',
      description: 'Year the project started',
      validation: (Rule: any) => Rule.required().min(1900).max(new Date().getFullYear())
    },
    {
      name: 'endYear',
      title: 'End Year',
      type: 'number',
      description: 'Year the project ended (leave empty if ongoing)',
      validation: (Rule: any) => Rule.optional().min(1900).max(new Date().getFullYear())
    },
    {
      name: 'isOngoing',
      title: 'Ongoing Project',
      type: 'boolean',
      description: 'Check if project is still ongoing (will display "Present")',
      initialValue: false
    },
    {
      name: 'locations',
      title: 'Locations',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'City, Country format recommended'
    },
    {
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
    },
    {
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true,
        metadata: ['blurhash', 'lqip', 'palette']
      },
      validation: (Rule: any) => Rule.required()
    },
    {
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
    },
    {
      name: 'collaborators',
      title: 'Collaborators',
      type: 'array',
      of: [{ type: 'string' }]
    },
    {
      name: 'publications',
      title: 'Publications',
      type: 'object',
      fields: [
        { name: 'en', type: 'array', of: [{ type: 'string' }], title: 'English' },
        { name: 'es', type: 'array', of: [{ type: 'string' }], title: 'Spanish' }
      ]
    },
    {
      name: 'isFeatured',
      title: 'Featured on Homepage',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first'
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
    prepare({ title, media, startYear, endYear, isOngoing }: any) {
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
}
