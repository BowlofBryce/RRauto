import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

export interface AdminColumn<T> {
  key: string
  label: string
  width?: string
  render?: (row: T) => ReactNode
}

interface AdminTableProps<T> {
  columns: AdminColumn<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  loading?: boolean
  emptyMessage?: string
  keyField?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AdminTable<T extends Record<string, any>>({ columns, data, onRowClick, loading, emptyMessage = 'No records', keyField = 'id' }: AdminTableProps<T>) {
  return (
    <div style={{ overflow: 'auto' }}>
      <style>{`
        .adm-row { transition: background 80ms ease; }
        .adm-row:hover { background: #fafafa !important; }
        @keyframes adm-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
      `}</style>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{
                padding: '8px 14px',
                fontSize: 10.5,
                fontWeight: 500,
                color: '#999',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textAlign: 'left',
                borderBottom: '1px solid #eee',
                position: 'sticky',
                top: 0,
                background: '#fff',
                width: col.width,
                whiteSpace: 'nowrap',
              }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <tr key={i}>
                {columns.map((_, ci) => (
                  <td key={ci} style={{ padding: '10px 14px' }}>
                    <div style={{ height: 12, borderRadius: 3, background: '#f0f0f0', width: ci === 0 ? '60%' : '35%', animation: 'adm-pulse 1.5s ease-in-out infinite' }} />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '40px 14px', textAlign: 'center', color: '#aaa', fontSize: 12.5 }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <motion.tr
                key={String(row[keyField] ?? i)}
                className="adm-row"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1, delay: i * 0.015 }}
                onClick={() => onRowClick?.(row)}
                style={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  borderBottom: '1px solid #f5f5f5',
                }}
              >
                {columns.map((col) => (
                  <td key={col.key} style={{
                    padding: '9px 14px',
                    fontSize: 12.5,
                    color: '#333',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 280,
                  }}>
                    {col.render ? col.render(row as T) : String(row[col.key] ?? '--')}
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
