interface SlidersIconProps {
  size?: number
}

export default function SlidersIcon({ size = 20 }: SlidersIconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.55}
      strokeLinecap="round"
    >
      <path d="M4 7h4" />
      <path d="M12 7h8" />
      <path d="M4 17h8" />
      <path d="M16 17h4" />
      <path d="M8 4.8v4.4" />
      <path d="M16 14.8v4.4" />
    </svg>
  )
}
