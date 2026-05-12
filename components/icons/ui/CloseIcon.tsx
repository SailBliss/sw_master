interface CloseIconProps {
  size?: number
}

export default function CloseIcon({ size = 20 }: CloseIconProps) {
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
      <path d="M6.8 6.8 17.2 17.2" />
      <path d="M17.2 6.8 6.8 17.2" />
    </svg>
  )
}
