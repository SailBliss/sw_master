'use client'

interface ProfileActionLinksProps {
  profileId: string
  whatsappUrl: string
  instagramHandle?: string | null
  websiteUrl?: string | null
}

function recordClick(profileId: string, type: 'whatsapp' | 'instagram' | 'website') {
  fetch('/api/tracking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId, type }),
  }).catch(() => {
    // Tracking must never block contact navigation.
  })
}

export default function ProfileActionLinks({
  profileId,
  whatsappUrl,
  instagramHandle,
  websiteUrl,
}: ProfileActionLinksProps) {
  const secondary = instagramHandle
    ? {
        href: `https://instagram.com/${instagramHandle}`,
        label: 'Ver Instagram',
        type: 'instagram' as const,
      }
    : websiteUrl
      ? {
          href: websiteUrl,
          label: 'Ver sitio web',
          type: 'website' as const,
        }
      : null

  return (
    <div className="sw-profile-actions">
      {secondary && (
        <a
          href={secondary.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => recordClick(profileId, secondary.type)}
          className="sw-profile-button sw-profile-button-secondary"
        >
          {secondary.label}
        </a>
      )}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => recordClick(profileId, 'whatsapp')}
        className="sw-profile-button sw-profile-button-primary"
      >
        Contactar por WhatsApp
        <span aria-hidden="true">-&gt;</span>
      </a>
    </div>
  )
}
