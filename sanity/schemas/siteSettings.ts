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
    }
  ]
}

export default siteSettings