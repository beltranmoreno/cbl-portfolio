export default {
  name: 'imageAsset',
  title: 'Image',
  type: 'document',
  fields: [
    {
      name: 'image',
      title: 'Image File',
      type: 'image',
      options: {
        hotspot: true,
        metadata: ['blurhash', 'lqip', 'palette', 'exif']
      },
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'caption',
      title: 'Caption / Title',
      type: 'object',
      fields: [
        { name: 'en', type: 'string', title: 'English' },
        { name: 'es', type: 'string', title: 'Spanish' }
      ]
    },
    {
      name: 'medium',
      title: 'Medium',
      type: 'string',
      options: {
        list: [
          { title: 'Film - Black & White', value: 'film-bw' },
          { title: 'Digital - Black & White', value: 'digital-bw' }
        ],
        layout: 'radio'
      },
      initialValue: 'film-bw',
      validation: (Rule: any) => Rule.required()
    },
    {
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
      hidden: ({ parent }: any) => parent?.medium === 'digital-bw',
      initialValue: '35mm'
    },
    {
      name: 'isFeatured',
      title: 'Featured (Homepage)',
      type: 'boolean',
      description: 'Show in homepage hero masonry',
      initialValue: false
    },
    {
      name: 'project',
      title: 'Project',
      type: 'reference',
      to: [{ type: 'project' }],
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags'
      },
      description: 'For filtering and organization'
    },
    {
      name: 'availableAsPrint',
      title: 'Available as Print',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'printProduct',
      title: 'Related Print Product',
      type: 'reference',
      to: [{ type: 'product' }],
      hidden: ({ parent }: any) => !parent?.availableAsPrint
    },
    {
      name: 'order',
      title: 'Order in Project',
      type: 'number',
      description: 'Sequence within the project gallery'
    }
  ],
  preview: {
    select: {
      media: 'image',
      caption: 'caption.en',
      project: 'project.title.en'
    },
    prepare({ media, caption, project }: any) {
      return {
        title: caption || 'Untitled',
        subtitle: project,
        media: media
      }
    }
  }
}
