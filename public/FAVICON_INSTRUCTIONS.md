# Favicon & Icons Setup Instructions

## Required Icon Files

To complete your SEO and PWA setup, please add the following icon files to the `public` folder:

### Favicon Files (Required)
- `favicon.ico` - 16x16, 32x32, 48x48 (multi-size ICO file)
- `favicon-16x16.png` - 16x16 PNG
- `favicon-32x32.png` - 32x32 PNG
- `favicon-192x192.png` - 192x192 PNG (for Android)
- `favicon-512x512.png` - 512x512 PNG (for Android)

### Apple Touch Icons (Required for iOS)
- `apple-touch-icon.png` - 180x180 PNG

### Microsoft Tiles (Optional)
- `mstile-150x150.png` - 150x150 PNG

### Open Graph Image (Required for Social Sharing)
- `og-image.png` - 1200x630 PNG (Facebook, LinkedIn, Twitter)
- `og-image-square.png` - 1200x1200 PNG (Instagram)

## How to Generate Icons

### Option 1: Use Online Tools
1. **RealFaviconGenerator.net** - https://realfavicongenerator.net/
   - Upload your logo
   - Configure settings for all platforms
   - Download and extract to public folder

2. **Favicon.io** - https://favicon.io/
   - Generate from text, image, or emoji
   - Download all formats

### Option 2: Manual Creation
1. Create a square logo (at least 512x512px)
2. Use image editing software (Photoshop, GIMP, Figma) to resize:
   - 16x16 → favicon-16x16.png
   - 32x32 → favicon-32x32.png
   - 192x192 → favicon-192x192.png
   - 512x512 → favicon-512x512.png
   - 180x180 → apple-touch-icon.png

### Option 3: Use npm package
\`\`\`bash
npm install -g sharp-cli
sharp -i logo.png -o favicon-16x16.png resize 16 16
sharp -i logo.png -o favicon-32x32.png resize 32 32
sharp -i logo.png -o favicon-192x192.png resize 192 192
sharp -i logo.png -o favicon-512x512.png resize 512 512
sharp -i logo.png -o apple-touch-icon.png resize 180 180
\`\`\`

## Open Graph Image Guidelines

The OG image appears when your site is shared on social media.

**Specifications:**
- Size: 1200x630 pixels
- Format: PNG or JPG
- Max file size: < 1MB
- Include: Logo, tagline, and brand colors
- Text: Large, readable fonts
- Design: Eye-catching, professional

**Tools to Create OG Images:**
- Canva (templates available)
- Figma
- Adobe Photoshop
- Online: https://www.opengraph.xyz/

## Current Status

✅ manifest.json - Created
✅ browserconfig.xml - Created
✅ HTML meta tags - Configured
❌ Icon files - **Need to be added**
❌ OG image - **Need to be added**

Once you add the icon files, your site will have complete favicon and PWA support!

