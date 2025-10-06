# Setup Guide - Carmen Ballvé Portfolio

Complete setup instructions for developers and content managers.

## For Developers

### Initial Setup

1. **Environment Variables**

   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```

   You'll need to fill in:
   - **Sanity credentials** (get from sanity.io dashboard)
   - **Stripe keys** (get from stripe.com dashboard)
   - **Site URL** (use `http://localhost:3000` for development)

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Sanity**

   Option A - Use Existing Sanity Project:
   - Get the Project ID from your Sanity dashboard
   - Get an API token with read/write permissions
   - Add them to `.env.local`

   Option B - Create New Sanity Project:
   ```bash
   npm install -g @sanity/cli
   sanity init
   ```

   Then copy the schemas from `sanity/schemas/` to your Sanity Studio.

4. **Configure Stripe**

   - Create products in Stripe Dashboard
   - For each product, get the Price ID (starts with `price_`)
   - Store these Price IDs in your Sanity product documents
   - Set up a webhook in Stripe Dashboard:
     - URL: `https://yoursite.com/api/webhooks/stripe`
     - Events: `checkout.session.completed`, `payment_intent.succeeded`
     - Copy the signing secret to `.env.local`

5. **Run Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

### Testing Stripe Locally

Use Stripe CLI to forward webhooks to your local server:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret from the CLI output to `.env.local`.

---

## For Content Managers (Carmen)

### Accessing Sanity Studio

Your Sanity Studio is hosted at: `https://[your-project].sanity.studio`

Login with your Sanity account credentials.

### Content Structure

Your site has 4 main content types:

#### 1. Projects (Photography Series)

Each project represents a body of work (e.g., a documentary series).

**Fields:**
- **Title** (EN/ES): Name of the project
- **Slug** (EN/ES): URL-friendly version (auto-generated)
- **Year**: e.g., "2018" or "2018-2020"
- **Locations**: Cities/countries where shot
- **Description** (EN/ES): 2-4 paragraphs about the project
- **Featured Image**: Main image for project card
- **Primary Medium**: Film or Digital
- **Collaborators**: Optional names
- **Publications**: Where this work has been featured
- **Featured on Homepage**: Checkbox to feature
- **Display Order**: Lower numbers appear first

#### 2. Images

Individual photographs that belong to projects.

**Fields:**
- **Image File**: Upload the photo
- **Caption** (EN/ES): Optional title/description
- **Medium**: Film or Digital
- **Film Format**: 35mm, 120, or N/A
- **Featured (Homepage)**: Show in main masonry grid
- **Project**: Link to parent project (required)
- **Tags**: Keywords for filtering
- **Available as Print**: Checkbox if selling
- **Print Product**: Link to shop product
- **Order in Project**: Sequence number

**Workflow for Adding Images:**
1. Create new Image Asset
2. Upload photo
3. Select the project it belongs to
4. Choose medium type (this affects the border style)
5. Add caption in both languages
6. Set order number (determines sequence in gallery)
7. Check "Featured" if you want it on homepage

#### 3. Products (Shop Items)

Prints or books for sale.

**Fields:**
- **Title** (EN/ES): Product name
- **Slug** (EN/ES): URL-friendly version
- **Images**: Product photos (can be multiple)
- **Description** (EN/ES): Details about the product
- **Base Price**: Price in USD
- **Stripe Product ID**: From Stripe Dashboard
- **Related Project**: Optional link to project
- **In Stock**: Checkbox
- **Variants**: Different sizes/options with different prices

**Workflow for Adding Products:**
1. First, create product in Stripe Dashboard
2. Copy the Price ID from Stripe
3. Create new Product in Sanity
4. Paste the Stripe Price ID
5. Add product images
6. Write description in both languages
7. Set price and stock status

#### 4. Site Settings

Global site information (only one document).

**Fields:**
- **Site Name**: Carmen Ballvé
- **About Bio** (EN/ES): Your biography text
- **About Image**: Portrait photo
- **Contact Email**: Your email
- **Social Links**: Instagram, etc.
- **Featured Projects**: Up to 4 projects for homepage

### Common Tasks

#### Publishing a New Project

1. Go to "Projects" in Sanity Studio
2. Click "Create new Project"
3. Fill in all fields (both EN and ES)
4. Upload featured image
5. Click "Publish"
6. Now upload images:
   - Go to "Images"
   - Create new Image Asset for each photo
   - Link each to your new project
   - Set order numbers (1, 2, 3, etc.)
   - Publish each image

#### Featuring Images on Homepage

1. Go to "Images"
2. Find the image you want to feature
3. Check "Featured (Homepage)"
4. Save/Publish

The homepage will automatically update.

#### Managing Shop Inventory

To mark a product as sold out:
1. Go to "Products"
2. Find the product
3. Uncheck "In Stock"
4. Publish

To restock:
1. Check "In Stock" again
2. Publish

#### Updating Your Bio

1. Go to "Site Settings"
2. Edit "About Bio" in English and Spanish
3. Publish

Changes appear immediately on the About page.

### Tips

- **Always fill in both EN and ES fields** for bilingual support
- **Use consistent location formatting**: "City, Country"
- **Image file names don't matter** - they're not shown publicly
- **Order numbers determine sequence** - you can use 10, 20, 30 to leave room for inserts
- **Preview changes** by visiting the live site (updates within 1 hour)

---

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables (same as `.env.local`)
5. Deploy

### Environment Variables for Production

Make sure to set these in Vercel:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SITE_URL=https://carmenballve.com
```

**Important:** Switch Stripe keys from `pk_test_` / `sk_test_` to `pk_live_` / `sk_live_` for production!

### Post-Deployment

1. Update Stripe webhook URL to your production domain
2. Test the entire site:
   - Browse projects
   - Filter archive
   - Switch languages
   - Add product to cart
   - Complete a test purchase
3. Submit sitemap to Google Search Console
4. Test on mobile devices

---

## Troubleshooting

### Images Not Loading

- Check that `NEXT_PUBLIC_SANITY_PROJECT_ID` is correct
- Verify images are published in Sanity
- Check browser console for errors

### Stripe Checkout Not Working

- Verify Stripe keys are correct (test vs. live)
- Check that Price IDs in Sanity match Stripe
- Look at Network tab in browser dev tools

### Language Switching Issues

- Clear browser cache
- Verify both EN and ES slugs exist for content
- Check middleware.ts configuration

### Build Errors

- Run `npm install` to update dependencies
- Delete `.next` folder and rebuild: `rm -rf .next && npm run build`
- Check for TypeScript errors: `npm run lint`

---

## Support

For technical issues, contact the developer or open an issue on GitHub.

For content questions, refer to this guide or the main README.md.
