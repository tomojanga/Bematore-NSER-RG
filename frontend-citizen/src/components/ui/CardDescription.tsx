import React from 'react'
import { cn } from '@/lib/utils'

interface CardDescriptionProps {
  className?: string
  children: React.ReactNode
}

export function CardDescription({ className, children }: CardDescriptionProps) {
  return (
    <p className={cn(
      'text-sm text-gray-500 dark:text-gray-400',
      className
    )}>
      {children}
    </p>
  )
}

export default CardDescription