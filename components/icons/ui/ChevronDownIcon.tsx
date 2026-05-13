interface ChevronDownIconProps {
  size?: number
}

export default function ChevronDownIcon({ size = 20 }: ChevronDownIconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.65}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6.8 9.4 5.2 5.2 5.2-5.2" />
    </svg>
  )
}
