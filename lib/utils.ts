// Converts a string to a URL-safe slug, handling accents and special characters
export function slugify(text: string): string {
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
