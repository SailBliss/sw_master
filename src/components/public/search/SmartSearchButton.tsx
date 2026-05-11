type SmartSearchButtonProps = {
  label?: string
  hint?: string
}

export function SmartSearchButton({
  label = 'Abrir chat inteligente',
  hint = 'Aqui se conectara la busqueda conversacional con /api/chat.',
}: SmartSearchButtonProps) {
  return (
    <button
      type="button"
      className="rounded-lg border border-dashed border-[--sw-line-strong] bg-[--bg] px-4 py-3 text-left text-sm text-[--fg]"
    >
      <span className="block font-semibold">{label}</span>
      <span className="mt-1 block text-xs text-[--fg-3]">{hint}</span>
    </button>
  )
}
