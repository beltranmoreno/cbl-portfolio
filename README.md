# Carmen Ballvé Photography Portfolio

A bilingual (English/Spanish) photography portfolio website with integrated e-commerce functionality.

## Tech Stack

- **Framework:** Next.js 15.5.4 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **CMS:** Sanity CMS v3
- **Payments:** Stripe
- **Image Optimization:** Next.js Image + Sanity
- **Internationalization:** Custom i18n with middleware

## Features

- ✅ Bilingual support (EN/ES) with automatic locale detection
- ✅ Responsive masonry grid layouts for photography
- ✅ Film border effects (35mm, 120 format)
- ✅ Lightbox gallery with keyboard navigation
- ✅ Filterable archive by location, year, and tags
- ✅ Project detail pages with rich metadata
- ✅ E-commerce shop with Stripe integration
- ✅ Timeline-based about page
- ✅ SEO optimized with proper meta tags and hreflang
- ✅ Accessibility features (WCAG AA compliant)

## Project Structure

```
carmen-ballve-portfolio/
├── app/
│   ├── [locale]/          # Locale-based routes
│   │   ├── about/         # About page
│   │   ├── archive/       # Filterable image archive
│   │   ├── projects/      # Project detail pages
│   │   │   └── [slug]/
│   │   ├── shop/          # E-commerce pages
│   │   │   ├── [slug]/    # Product detail
│   │   │   └── success/   # Order confirmation
│   │   ├── layout.tsx     # Locale layout with Nav/Footer
│   │   └── page.tsx       # Homepage
│   ├── api/
│   │   ├── checkout/      # Stripe checkout API
│   │   └── webhooks/      # Stripe webhooks
│   └── globals.css        # Global styles & design tokens
├── components/            # React components
│   ├── Navigation.tsx
│   ├── Footer.tsx
│   ├── LanguageToggle.tsx
│   ├── MasonryGrid.tsx
│   ├── ImageWithBorder.tsx
│   └── Lightbox.tsx
├── lib/                   # Utilities
│   ├── sanity.client.ts   # Sanity client configuration
│   ├── sanity.queries.ts  # Data fetching functions
│   └── i18n.ts            # Internationalization utilities
├── locales/               # Translation files
│   ├── en/
│   └── es/
├── sanity/                # Sanity CMS schemas
│   └── schemas/
│       ├── project.ts
│       ├── imageAsset.ts
│       ├── product.ts
│       └── siteSettings.ts
├── middleware.ts          # Locale detection & routing
└── next.config.ts
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Sanity account and project
- A Stripe account (for e-commerce)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd cbl-portfolio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

   Fill in your credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_TOKEN=your_api_token

   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...

   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Set up Sanity CMS:**

   Create a Sanity project at https://www.sanity.io:
   - Sign up or log in
   - Create a new project
   - Copy your Project ID
   - Generate an API token with Editor permissions
   - Add both to `.env.local`

   The schemas are already configured in `sanity/schemas/`:
   - `project.ts` - Photography projects
   - `imageAsset.ts` - Individual images
   - `product.ts` - Shop products
   - `siteSettings.ts` - Site-wide settings

5. **Set up Stripe:**

   - Create products in your Stripe Dashboard
   - Note the Product IDs and Price IDs
   - Add them to your Sanity product documents
   - Set up a webhook endpoint pointing to `/api/webhooks/stripe`

6. **Run the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

7. **Access Sanity Studio:**

   Once the dev server is running, access the CMS at:

   **http://localhost:3000/studio**

   You'll be prompted to log in with your Sanity account. This is where you'll manage all content (projects, images, products, settings).

## Configuration

### Customizing Colors

Edit the CSS variables in `app/globals.css`:

```css
:root {
  --color-primary: 139 0 0;        /* Darkroom red */
  --color-primary-light: 160 17 26;
  --color-primary-dark: 107 0 0;
  /* ... more colors */
}
```

### Customizing Fonts

Edit the font imports in `app/[locale]/layout.tsx`:

```typescript
import { Inter, Crimson_Pro } from 'next/font/google'
```

### Film Border Styles

The film borders are controlled via CSS classes in `globals.css`:
- `.image-film-35mm` - 35mm film with sprocket holes
- `.image-film-120` - Medium format 120
- `.image-digital` - Clean digital look

Adjust border widths with CSS variables:
```css
--film-border-35mm: 4px;
--film-border-120: 6px;
```

### Grain Texture

Control grain opacity:
```css
--grain-opacity: 0.02; /* 2% - very subtle */
```

## Content Management

### Adding a New Project

1. Go to your Sanity Studio
2. Create a new **Project** document
3. Fill in:
   - Title (EN/ES)
   - Slug (EN/ES)
   - Year or year range
   - Locations
   - Description (EN/ES)
   - Featured image
   - Primary medium
4. Upload images as **Image Assets** and reference the project
5. Set display order for images

### Adding Products to Shop

1. Create a **Product** document in Sanity
2. Fill in:
   - Title (EN/ES)
   - Slug (EN/ES)
   - Product images
   - Description (EN/ES)
   - Base price
   - Stripe Product ID
3. Optionally add variants with different prices
4. Link to related project if applicable

### Site Settings

Edit the **Site Settings** singleton in Sanity:
- About page bio (EN/ES)
- About page portrait image
- Contact email
- Social media links
- Featured projects for homepage

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Post-Deployment Checklist

- [ ] Update Stripe webhook URL to production domain
- [ ] Switch Stripe keys to live mode
- [ ] Test checkout flow end-to-end
- [ ] Verify all images load correctly
- [ ] Test language switching
- [ ] Run Lighthouse audit
- [ ] Submit sitemap to Google Search Console

## Performance

- **Image Optimization:** Next.js automatically optimizes images with blur placeholders
- **Lazy Loading:** Images load as they enter the viewport
- **ISR (Incremental Static Regeneration):** Pages revalidate every hour
- **Font Loading:** Fonts use `display: swap` for faster initial render

## Accessibility

- Semantic HTML5 elements throughout
- ARIA labels on interactive elements
- Keyboard navigation support (especially in lightbox)
- Focus visible styles
- Alt text on all images
- Skip to content link
- Color contrast meets WCAG AA

## Internationalization

- Path-based locales: `/en/...` and `/es/...`
- Automatic locale detection via `Accept-Language` header
- All content translatable via Sanity
- UI strings in `locales/` directory
- Proper hreflang tags for SEO

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Graceful degradation for older browsers

## License

© 2025 Carmen Ballvé. All rights reserved.

## Support

For issues or questions, please contact the developer or open an issue in the repository.
