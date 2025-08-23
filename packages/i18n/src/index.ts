
export function getDirection(locale: string): 'rtl' | 'ltr' {
  return ['ar', 'he', 'fa', 'ur'].includes(locale) ? 'rtl' : 'ltr';
}
