interface SparkleIconProps {
  size?: number
}

export default function SparkleIcon({ size = 20 }: SparkleIconProps) {
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
      strokeLinejoin="round"
    >
      <path d="M12 3.8 14.1 9.9 20.2 12 14.1 14.1 12 20.2 9.9 14.1 3.8 12 9.9 9.9 12 3.8Z" />
      <path d="M18.2 3.6 18.9 5.4 20.7 6.1 18.9 6.8 18.2 8.6 17.5 6.8 15.7 6.1 17.5 5.4 18.2 3.6Z" />
    </svg>
  )
}
