# Translation Template

Quick reference for adding translations to new pages or components.

## Basic Component Template

```tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const MyComponent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      {/* Simple text */}
      <h1>{t('mySection.title')}</h1>
      <p>{t('mySection.description')}</p>

      {/* Button */}
      <button>{t('mySection.buttonText')}</button>

      {/* With variables */}
      <p>{t('mySection.welcome', { name: 'John' })}</p>

      {/* Array of items */}
      {(t('mySection.items', { returnObjects: true }) as string[]).map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </div>
  );
};

export default MyComponent;
```

## JSON Translation Structure

### src/i18n/locales/en/translation.json
```json
{
  "mySection": {
    "title": "My Page Title",
    "description": "This is a description",
    "buttonText": "Click Here",
    "welcome": "Welcome, {{name}}!",
    "items": [
      "First item",
      "Second item",
      "Third item"
    ]
  }
}
```

### src/i18n/locales/es/translation.json
```json
{
  "mySection": {
    "title": "Título de Mi Página",
    "description": "Esta es una descripción",
    "buttonText": "Haz Clic Aquí",
    "welcome": "¡Bienvenido, {{name}}!",
    "items": [
      "Primer elemento",
      "Segundo elemento",
      "Tercer elemento"
    ]
  }
}
```

## Common Patterns

### 1. Navigation Links
```tsx
const links = [
  { path: '/about', label: t('nav.about') },
  { path: '/contact', label: t('nav.contact') },
  { path: '/pricing', label: t('nav.pricing') }
];
```

### 2. Form Labels
```tsx
<form>
  <label>{t('form.email')}</label>
  <input type="email" placeholder={t('form.emailPlaceholder')} />

  <label>{t('form.password')}</label>
  <input type="password" placeholder={t('form.passwordPlaceholder')} />

  <button type="submit">{t('form.submit')}</button>
</form>
```

### 3. Error Messages
```tsx
const errors = {
  required: t('errors.required'),
  invalid: t('errors.invalid'),
  tooShort: t('errors.tooShort', { min: 6 })
};
```

### 4. Conditional Text
```tsx
<p>
  {isLoading
    ? t('status.loading')
    : t('status.ready')
  }
</p>
```

### 5. Pluralization
```json
{
  "items": "{{count}} item",
  "items_plural": "{{count}} items"
}
```

```tsx
<p>{t('items', { count: qrCodes.length })}</p>
```

## Translation Key Naming Convention

Use dot notation with clear hierarchy:

```
section.subsection.element

Examples:
- header.nav.home
- footer.legal.privacy
- dashboard.stats.totalScans
- pricing.plan.features
- form.validation.required
```

## Quick Translation Checklist

When adding a new page:

- [ ] Create section in each translation.json file (all 5 languages)
- [ ] Import useTranslation hook
- [ ] Replace all hardcoded text with t() calls
- [ ] Test in all languages
- [ ] Check layout doesn't break with longer text
- [ ] Verify mobile responsiveness

## Common Translation Mistakes

❌ **Don't:**
```tsx
const text = "Hello World";
return <h1>{text}</h1>;
```

✅ **Do:**
```tsx
const { t } = useTranslation();
return <h1>{t('greeting.hello')}</h1>;
```

---

❌ **Don't:**
```tsx
// Inline text
<button>Click Here</button>
```

✅ **Do:**
```tsx
const { t } = useTranslation();
<button>{t('button.clickHere')}</button>
```

---

❌ **Don't:**
```json
{
  "text": "Hello,\nWorld"
}
```

✅ **Do:**
```json
{
  "greeting": "Hello",
  "world": "World"
}
```

## Testing New Translations

```javascript
// Browser console
import { i18n } from 'i18next';

// Check if key exists
i18n.exists('mySection.title'); // true/false

// Get translation
i18n.t('mySection.title'); // Returns translation

// Change language to test
i18n.changeLanguage('es');
i18n.t('mySection.title'); // Should return Spanish
```

## Language-Specific Considerations

### Spanish (es)
- Longer text (~30% more than English)
- Use formal "usted" for professional contexts
- Include accent marks (á, é, í, ó, ú, ñ)

### Hindi (hi)
- Can be significantly longer
- Test with actual Hindi fonts
- Ensure proper Unicode support

### French (fr)
- Uses «guillemets» for quotes
- Nouns have gender (le/la)
- Formal vs informal (vous/tu)

### German (de)
- Compound words can be very long
- Nouns are capitalized
- Formal vs informal (Sie/du)

## Quick Copy-Paste Snippets

### Import Statement
```tsx
import { useTranslation } from 'react-i18next';
```

### Hook Declaration
```tsx
const { t } = useTranslation();
```

### Simple Usage
```tsx
{t('section.key')}
```

### With Variable
```tsx
{t('section.key', { variable: value })}
```

### Array
```tsx
{(t('section.array', { returnObjects: true }) as string[])}
```

## Need Help?

- See `I18N_GUIDE.md` for comprehensive documentation
- See `I18N_QUICK_START.md` for testing instructions
- Check [react-i18next docs](https://react.i18next.com/) for advanced features

---

**Pro Tip**: Keep a browser tab open with all 5 translation files side by side for easier editing!

