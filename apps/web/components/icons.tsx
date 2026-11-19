type IconProps = { path: string; filled?: boolean }

function Icon({ path, filled }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill={filled ? "currentColor" : "none"}
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
export const PlayIcon = () => <Icon filled path="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
export const StopIcon = () => <Icon filled path="M7 6h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
export const TagIcon = () => (
  <Icon path="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4ZM7.5 7.5h.01" />
)
export const CheckIcon = () => <Icon path="M20 6 9 17l-5-5" />
