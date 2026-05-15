type CategoryChipProps = {
  label: string
  selected?: boolean
}

export function CategoryChip({ label, selected = false }: CategoryChipProps) {
  return (
    <span
      className={
        selected
          ? 'inline-flex rounded-full bg-[--accent] px-3 py-1.5 text-xs font-semibold text-sw-cream'
          : 'inline-flex rounded-full border border-[--sw-line] bg-sw-paper px-3 py-1.5 text-xs text-[--fg-2]'
      }
    >
      {label}
    </span>
  )
}
