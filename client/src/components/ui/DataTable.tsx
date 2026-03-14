import type { CSSProperties, ReactNode } from 'react'
import { motion } from 'framer-motion'

export interface Column<T> {
  key: string
  label: string
  width?: string
  render?: (row: T) => ReactNode
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  emptyMessage?: string
  loading?: boolean
}

const cellStyle: CSSProperties = {
  padding: '10px 16px',
  fontSize: 'var(--text-base)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const headerCellStyle: CSSProperties = {
  ...cellStyle,
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--weight-medium)' as string,
  color: 'var(--color-text-tertiary)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  userSelect: 'none',
  position: 'sticky',
  top: 0,
  background: 'var(--color-bg-elevated)',
  borderBottom: '1px solid var(--color-border)',
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={cellStyle}>
          <div
            style={{
              height: 14,
              borderRadius: 4,
              background: 'var(--color-bg-muted)',
              width: i === 0 ? '60%' : '40%',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        </td>
      ))}
    </tr>
  )
}

export function DataTable<T extends { id: string }>({ columns, data, onRowClick, emptyMessage = 'No records found', loading }: DataTableProps<T>) {
  return (
    <div style={{ overflow: 'auto', flex: 1 }}>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .dt-row { transition: background 100ms ease; }
        .dt-row:hover { background: var(--color-bg-subtle) !important; }
      `}</style>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ ...headerCellStyle, width: col.width, textAlign: 'left' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={columns.length} />)
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '48px 16px', textAlign: 'center' }}>
                <div style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-base)' }}>
                  {emptyMessage}
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <motion.tr
                key={row.id}
                className="dt-row"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, delay: i * 0.02 }}
                onClick={() => onRowClick?.(row)}
                style={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  borderBottom: '1px solid var(--color-border-subtle)',
                }}
              >
                {columns.map((col) => (
                  <td key={col.key} style={cellStyle}>
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '--')}
                  </td>
                ))}
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
