import type { ReactNode } from 'react'

interface Props {
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: Props) {
  return (
    <div className="flex items-center justify-between pb-7">
      <div>
        <h1 className="text-[18px] font-semibold text-1 tracking-[-0.3px]">{title}</h1>
        {description && <p className="text-[13px] text-3 mt-0.5">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
