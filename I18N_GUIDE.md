
# I18N & RTL Guide

- Routes: `/{locale}/...` (en, ar, he)
- Strings: ICU JSON in `apps/web/src/locales`
- Direction: `<html dir="rtl|ltr">` toggled in `layout.tsx`
- Tailwind: use logical utilities `ms/me`, `ps/pe`, `text-start/end`
- Middleware: redirects default to `/en` and enforces locale prefix
- UGC translations: plan to use separate `_translations` tables

Example ICU:
```json
{
  "Home": {
    "title": "Welcome",
    "intro": "This is a multilingual legal office management system."
  }
}
```
