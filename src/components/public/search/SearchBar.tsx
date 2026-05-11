type SearchBarProps = {
  action?: string
  name?: string
  placeholder?: string
  defaultValue?: string
  buttonLabel?: string
}

export function SearchBar({
  action = '/directorio',
  name = 'q',
  placeholder = 'Buscar negocio, categoria o palabra clave',
  defaultValue,
  buttonLabel = 'Buscar',
}: SearchBarProps) {
  return (
    <form
      action={action}
      method="get"
      className="flex w-full flex-col gap-2 rounded-lg border border-[--sw-line-strong] bg-sw-paper p-2 sm:flex-row"
    >
      <input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="min-h-11 flex-1 rounded-md border border-transparent bg-transparent px-3 text-sm text-[--fg] outline-none focus:border-[--accent]"
      />
      <button
        type="submit"
        className="min-h-11 rounded-md bg-[--accent] px-5 text-sm font-semibold text-sw-cream"
      >
        {buttonLabel}
      </button>
    </form>
  )
}
