type IconProps = { path: string }

function Icon({ path }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  )
}

export const PencilIcon = () => <Icon path="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
export const TrashIcon = () => <Icon path="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5" />
export const XIcon = () => <Icon path="M18 6 6 18M6 6l12 12" />
export const PlusIcon = () => <Icon path="M5 12h14M12 5v14" />
export const ChevronLeftIcon = () => <Icon path="m15 18-6-6 6-6" />
export const ChevronRightIcon = () => <Icon path="m9 18 6-6-6-6" />
