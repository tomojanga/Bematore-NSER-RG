'use client'

interface ChartData {
  label: string
  value: number
  color?: string
}

interface SimpleChartProps {
  data: ChartData[]
  type: 'bar' | 'line' | 'pie'
  height?: number
  title?: string
}

export default function SimpleChart({ data, type, height = 200, title }: SimpleChartProps) {
  const maxValue = Math.max(...data.map(d => d.value))
  
  if (type === 'bar') {
    return (
      <div className="w-full">
        {title && <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>}
        <div className="flex items-end space-x-2" style={{ height }}>
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className={`w-full ${item.color || 'bg-blue-500'} rounded-t transition-all duration-500`}
                style={{ 
                  height: `${(item.value / maxValue) * (height - 40)}px`,
                  minHeight: '4px'
                }}
              />
              <div className="mt-2 text-xs text-gray-600 text-center">
                <div className="font-medium">{item.value.toLocaleString()}</div>
                <div className="truncate w-full">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  if (type === 'line') {
    return (
      <div className="w-full">
        {title && <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>}
        <div className="relative" style={{ height }}>
          <svg width="100%" height="100%" className="overflow-visible">
            <polyline
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              points={data.map((item, index) => 
                `${(index / (data.length - 1)) * 100}%,${100 - (item.value / maxValue) * 80}%`
              ).join(' ')}
            />
            {data.map((item, index) => (
              <circle
                key={index}
                cx={`${(index / (data.length - 1)) * 100}%`}
                cy={`${100 - (item.value / maxValue) * 80}%`}
                r="3"
                fill="#3B82F6"
              />
            ))}
          </svg>
        </div>
      </div>
    )
  }
  
  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>}
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{item.label}</span>
            <span className="text-sm font-medium">{item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}