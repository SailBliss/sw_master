// Converts text to a URL-safe slug, handling accents and special characters.
// Accepts nullable input to avoid runtime crashes from unexpected DB values.
export function slugify(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .replace(/[áàäâã]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöôõ]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

// Builds a WhatsApp deep-link URL, prepending the Colombian country code if absent
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const normalized = digits.startsWith('57') ? digits : `57${digits}`;
  return `https://wa.me/${normalized}`;
}

export const CATEGORIES: string[] = [
  'Moda y accesorios',
  'Salud y bienestar',
  'Alimentación',
  'Belleza y cuidado personal',
  'Hogar y decoración',
  'Educación y servicios',
  'Tecnología',
  'Arte y entretenimiento',
]
