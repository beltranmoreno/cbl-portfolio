import { Rule } from "sanity"

const siteSettings = {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    {
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      initialValue: 'Carmen Ballvé',
      validation: (Rule: Rule) => Rule.required()
    },
    {
      name: 'aboutBio',
      title: 'About Page Bio',
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
      name: 'aboutImage',
      title: 'About Page Portrait',
      type: 'image',
      options: { hotspot: true }
    },
    {
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
      validation: (Rule: Rule) => Rule.email()
    },
    {
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {
            name: 'platform',
            type: 'string',
            title: 'Platform',
            options: {
              list: ['Instagram', 'Twitter', 'Facebook', 'LinkedIn', 'Other']
            }
          },
          { name: 'url', type: 'url', title: 'URL' }
        ]
      }]
    },
    {
      name: 'featuredProjects',
      title: 'Featured Projects (Homepage)',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'project' }] }],
      validation: (Rule: Rule) => Rule.max(4),
      description: 'Max 4 projects to feature on homepage'
    },
    {
      name: 'exhibitions',
      title: 'Notable Exhibitions',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {
            name: 'title',
            title: 'Exhibition Title',
            type: 'object',
            fields: [
              { name: 'en', type: 'string', title: 'English' },
              { name: 'es', type: 'string', title: 'Spanish' }
            ]
          },
          {
            name: 'venue',
            title: 'Venue',
            type: 'object',
            fields: [
              { name: 'en', type: 'string', title: 'English' },
              { name: 'es', type: 'string', title: 'Spanish' }
            ]
          },
          {
            name: 'location',
            title: 'Location (City, Country)',
            type: 'string'
          },
          {
            name: 'year',
            title: 'Year',
            type: 'number',
            validation: (Rule: Rule) => Rule.required().min(1900).max(2100)
          },
          {
            name: 'type',
            title: 'Exhibition Type',
            type: 'string',
            options: {
              list: [
                { title: 'Solo Exhibition', value: 'solo' },
                { title: 'Group Exhibition', value: 'group' }
              ]
            }
          }
        ],
        preview: {
          select: {
            title: 'title.en',
            venue: 'venue.en',
            year: 'year'
          },
          prepare({ title, venue, year }: { title: string; venue: string; year: number }) {
            return {
              title: title || 'Untitled Exhibition',
              subtitle: `${venue || 'Unknown Venue'} (${year || 'No year'})`
            }
          }
        }
      }]
    },
    {
      name: 'awards',
      title: 'Awards & Recognitions',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {
            name: 'title',
            title: 'Award Title',
            type: 'object',
            fields: [
              { name: 'en', type: 'string', title: 'English' },
              { name: 'es', type: 'string', title: 'Spanish' }
            ]
          },
          {
            name: 'organization',
            title: 'Awarding Organization',
            type: 'object',
            fields: [
              { name: 'en', type: 'string', title: 'English' },
              { name: 'es', type: 'string', title: 'Spanish' }
            ]
          },
          {
            name: 'year',
            title: 'Year',
            type: 'number',
            validation: (Rule: Rule) => Rule.required().min(1900).max(2100)
          },
          {
            name: 'description',
            title: 'Description (optional)',
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
          }
        ],
        preview: {
          select: {
            title: 'title.en',
            organization: 'organization.en',
            year: 'year'
          },
          prepare({ title, organization, year }: { title: string; organization: string; year: number }) {
            return {
              title: title || 'Untitled Award',
              subtitle: `${organization || 'Unknown Organization'} (${year || 'No year'})`
            }
          }
        }
      }]
    }
  ]
}

export default siteSettings