import React from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

interface TableColumn<T = any> {
  key: keyof T | string
  title: string
  sortable?: boolean
  width?: string
  render?: (value: any, record: T, index: number) => React.ReactNode
}

interface TableProps<T = any> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  pagination?: {
    current: number
    total: number
    pageSize: number
    onPageChange: (page: number) => void
    hasNext?: boolean
    hasPrevious?: boolean
  }
  onSort?: (key: string, direction: 'asc' | 'desc') => void
  sortKey?: string
  sortDirection?: 'asc' | 'desc'
  emptyMessage?: string
  className?: string
}

export function Table<T = any>({
  data,
  columns,
  loading = false,
  pagination,
  onSort,
  sortKey,
  sortDirection,
  emptyMessage = 'No data available',
  className
}: TableProps<T>) {
  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable || !onSort) return
    
    const key = column.key as string
    const direction = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc'
    onSort(key, direction)
  }

  const getSortIcon = (column: TableColumn<T>) => {
    if (!column.sortable) return null
    
    const key = column.key as string
    if (sortKey !== key) return '↕️'
    return sortDirection === 'asc' ? '↑' : '↓'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer hover:bg-gray-100 transition-colors',
                    column.width && `w-${column.width}`
                  )}
                  onClick={() => column.sortable && handleSort(column)}
                >
                  <div className="flex items-center justify-between">
                    <span>{column.title}</span>
                    {getSortIcon(column) && (
                      <span className="ml-1 text-gray-400">{getSortIcon(column)}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((record, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                {columns.map((column, colIndex) => (
                  <td 
                    key={colIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {column.render 
                      ? column.render(record[column.key as keyof T], record, rowIndex)
                      : String(record[column.key as keyof T] || '-')
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-700">
            <span>
              Showing page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
              {' '}({pagination.total} total items)
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.current - 1)}
              disabled={!pagination.hasPrevious}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <span className="px-3 py-2 text-sm text-gray-700">
              {pagination.current}
            </span>
            
            <button
              onClick={() => pagination.onPageChange(pagination.current + 1)}
              disabled={!pagination.hasNext}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Action menu for table rows
interface ActionMenuProps {
  actions: Array<{
    label: string
    onClick: () => void
    icon?: React.ReactNode
    destructive?: boolean
    disabled?: boolean
  }>
}

export function ActionMenu({ actions }: ActionMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-gray-100 rounded transition-colors"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick()
                setIsOpen(false)
              }}
              disabled={action.disabled}
              className={cn(
                'w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors',
                action.destructive && 'text-red-600 hover:bg-red-50',
                action.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}