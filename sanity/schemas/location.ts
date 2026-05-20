import { defineField, defineType } from 'sanity'

const location = defineType({
  name: 'location',
  title: 'Location',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'object',
      description: 'Display name. City, Country format recommended.',
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
          options: { source: 'name.en', maxLength: 96 }
        },
        {
          name: 'es',
          type: 'slug',
          title: 'Spanish Slug',
          options: { source: 'name.es', maxLength: 96 }
        }
      ]
    })
  ],
  orderings: [
    {
      title: 'Name (A–Z)',
      name: 'nameAsc',
      by: [{ field: 'name.en', direction: 'asc' }]
    },
    {
      title: 'Name (Z–A)',
      name: 'nameDesc',
      by: [{ field: 'name.en', direction: 'desc' }]
    }
  ],
  preview: {
    select: {
      en: 'name.en',
      es: 'name.es'
    },
    prepare({ en, es }) {
      return {
        title: en || es || '(unnamed location)',
        subtitle: en && es ? es : undefined
      }
    }
  }
})

export default location
