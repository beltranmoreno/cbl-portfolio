export default {
  name: 'product',
  title: 'Product',
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
          options: { source: 'title.en' }
        },
        {
          name: 'es',
          type: 'slug',
          title: 'Spanish Slug',
          options: { source: 'title.es' }
        }
      ]
    },
    {
      name: 'images',
      title: 'Product Images',
      type: 'array',
      of: [{
        type: 'image',
        options: { hotspot: true }
      }],
      validation: (Rule: any) => Rule.required().min(1)
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
      name: 'price',
      title: 'Base Price (USD)',
      type: 'number',
      validation: (Rule: any) => Rule.required().positive()
    },
    {
      name: 'stripeProductId',
      title: 'Stripe Product ID',
      type: 'string',
      description: 'From Stripe Dashboard'
    },
    {
      name: 'relatedProject',
      title: 'Related Project',
      type: 'reference',
      to: [{ type: 'project' }],
      description: 'Optional - link to source project'
    },
    {
      name: 'inStock',
      title: 'In Stock',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'variants',
      title: 'Variants',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {
            name: 'name',
            type: 'object',
            fields: [
              { name: 'en', type: 'string', title: 'English' },
              { name: 'es', type: 'string', title: 'Spanish' }
            ]
          },
          { name: 'price', type: 'number', title: 'Price (USD)' },
          { name: 'stripePriceId', type: 'string', title: 'Stripe Price ID' },
          { name: 'inStock', type: 'boolean', initialValue: true }
        ]
      }]
    }
  ],
  preview: {
    select: {
      title: 'title.en',
      media: 'images.0',
      price: 'price'
    },
    prepare({ title, media, price }: any) {
      return {
        title: title,
        subtitle: `$${price}`,
        media: media
      }
    }
  }
}
