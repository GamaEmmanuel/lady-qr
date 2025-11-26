# Internationalization (i18n) Guide

## Overview

Your Lady QR application now supports **5 languages**:
- 🇬🇧 English (en)
- 🇪🇸 Spanish (es)
- 🇮🇳 Hindi (hi)
- 🇫🇷 French (fr)
- 🇩🇪 German (de)

The system automatically detects the user's browser language and displays content accordingly. Users can also manually switch languages using the language switcher in the header.

## How It Works

### 1. Automatic Language Detection
The system detects language in this order:
1. **localStorage** - Previously selected language
2. **Browser language** - User's browser/system language
3. **Fallback** - English (if no match found)

### 2. Language Switcher
A globe icon (🌐) in the header allows users to manually switch between languages. The selection is saved to localStorage and persists across sessions.

### 3. Dynamic HTML Lang Attribute
When the language changes, the `<html lang="...">` attribute updates automatically for better SEO and accessibility.

## File Structure

```
src/
├── i18n/
│   ├── config.ts                    # i18n configuration
│   └── locales/
│       ├── en/translation.json      # English translations
│       ├── es/translation.json      # Spanish translations
│       ├── hi/translation.json      # Hindi translations
│       ├── fr/translation.json      # French translations
│       └── de/translation.json      # German translations
├── components/
│   └── LanguageSwitcher.tsx         # Language selector component
└── main.tsx                         # i18n initialization
```

## How to Use Translations in Components

### Basic Usage

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('header.home')}</h1>
      <p>{t('footer.tagline')}</p>
    </div>
  );
};
```

### With Arrays

```tsx
const features = t('home.customization.colors.features', { returnObjects: true }) as string[];

features.map(feature => <li>{feature}</li>);
```

### With Variables (Interpolation)

If you need to add variables to translations:

```json
// In translation.json
{
  "welcome": "Welcome, {{name}}!"
}
```

```tsx
// In component
t('welcome', { name: 'John' })  // Output: "Welcome, John!"
```

## Adding Translations to New Pages

### Step 1: Add Translations to JSON Files

Add your translations to all 5 language files:

**src/i18n/locales/en/translation.json**
```json
{
  "myPage": {
    "title": "My Page Title",
    "description": "This is my page"
  }
}
```

**src/i18n/locales/es/translation.json**
```json
{
  "myPage": {
    "title": "Título de mi página",
    "description": "Esta es mi página"
  }
}
```

*(Repeat for hi, fr, de)*

### Step 2: Use in Component

```tsx
import { useTranslation } from 'react-i18next';

const MyPage = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('myPage.title')}</h1>
      <p>{t('myPage.description')}</p>
    </div>
  );
};
```

## Currently Translated Pages

- ✅ **Header** - All navigation items, user menu
- ✅ **Footer** - All sections and links
- ✅ **Home Page** - Complete translation including:
  - Hero section
  - Analytics section
  - QR types
  - Static vs Dynamic comparison
  - Customization options
  - Security section
  - CTA section

## Pages That Still Need Translation

To complete the internationalization, you should add translations for:

1. **Login** (`src/pages/Login.tsx`)
2. **Register** (`src/pages/Register.tsx`)
3. **Dashboard** (`src/pages/Dashboard.tsx`)
4. **Create** (`src/pages/Create.tsx`)
5. **CreateGuest** (`src/pages/CreateGuest.tsx`)
6. **Profile** (`src/pages/Profile.tsx`)
7. **Pricing** (`src/pages/Pricing.tsx`)
8. **Features** (`src/pages/Features.tsx`)
9. **FAQ** (`src/pages/FAQ.tsx`)
10. **Contact** (`src/pages/Contact.tsx`)
11. **Privacy** (`src/pages/Privacy.tsx`)
12. **Terms** (`src/pages/Terms.tsx`)
13. **Cookies** (`src/pages/Cookies.tsx`)

## Translation Tips

### For Technical Content
- Keep QR code terminology consistent
- Maintain brand voice across languages
- Don't translate technical terms like "QR", "URL", "API"

### For UI Elements
- Keep button text short and action-oriented
- Test translations in the UI (some languages take more space)
- Ensure proper pluralization

### Getting Professional Translations
The current translations are machine-translated. For production:
1. Hire professional translators
2. Use translation services (e.g., Lokalise, Crowdin)
3. Have native speakers review the translations
4. Test with users from different regions

## Testing

### Test Language Detection
1. Clear localStorage: `localStorage.clear()`
2. Change browser language settings
3. Reload the page
4. Verify correct language loads

### Test Language Switching
1. Click the globe icon in header
2. Select different languages
3. Verify content changes immediately
4. Reload and verify language persists

### Test All Pages
Navigate through all pages to ensure:
- No missing translations (shows key instead of text)
- Text fits properly in UI
- No layout issues in different languages

## SEO Considerations

### Current Implementation
- ✅ HTML `lang` attribute updates dynamically
- ✅ `dir` attribute set for RTL support (if needed later)
- ✅ User preference saved in localStorage

### Future Enhancements
Consider adding:
- Language-specific URLs (`/es/home`, `/fr/home`)
- `hreflang` tags for better SEO
- Separate sitemaps for each language
- Language-specific metadata

## Troubleshooting

### Translation Not Showing
- Check if the key exists in translation.json
- Verify the key path is correct (e.g., `home.hero.title`)
- Check browser console for i18n errors

### Language Not Detected
- Clear browser cache and localStorage
- Check browser language settings
- Verify the language code matches (en, es, hi, fr, de)

### Text Overflowing UI
- Adjust CSS with language-specific classes if needed
- Use flexible layouts (flex, grid)
- Test with longest expected text

## Adding More Languages

To add a new language (e.g., Portuguese):

1. Create translation file:
   ```
   src/i18n/locales/pt/translation.json
   ```

2. Update i18n config:
   ```typescript
   // src/i18n/config.ts
   import ptTranslation from './locales/pt/translation.json';

   const resources = {
     // ... existing languages
     pt: {
       translation: ptTranslation
     }
   };
   ```

3. Add to language switcher:
   ```typescript
   // src/components/LanguageSwitcher.tsx
   const languages = [
     // ... existing languages
     { code: 'pt', name: 'Português', flag: '🇵🇹' },
   ];
   ```

## Support

For translation questions or issues:
- Check the i18next documentation: https://www.i18next.com/
- Review react-i18next guide: https://react.i18next.com/

---

**Note**: The translations provided are machine-generated for demonstration. For production use, please have them reviewed and refined by native speakers or professional translators to ensure cultural appropriateness and accuracy.

