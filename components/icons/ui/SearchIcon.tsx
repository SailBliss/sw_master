interface SearchIconProps {
  size?: number
}

export default function SearchIcon({ size = 20 }: SearchIconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="10.25"
        cy="10.25"
        r="6.1"
        stroke="currentColor"
        strokeWidth={1.15}
      />
      <path
        d="m14.95 14.95 5.05 5.05"
        stroke="currentColor"
        strokeWidth={1.55}
        strokeLinecap="round"
      />
    </svg>
  )
}
