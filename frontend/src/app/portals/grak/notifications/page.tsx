'use client'

import { useNotifications } from '@/hooks/useNotifications'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function GRAKNotificationsPage() {
  const { data, isLoading } = useNotifications()

  const notifications = data?.data?.items || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">System alerts and important updates</p>
        </div>
        <Button>Mark All as Read</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">No notifications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification: any) => (
                <div
                  key={notification.id}
                  className={cn('flex items-start gap-4 p-4 rounded-lg border', {
                    'bg-blue-50 border-blue-200': !notification.is_read,
                    'bg-white border-gray-200': notification.is_read
                  })}
                >
                  <div className={cn('h-10 w-10 rounded-full flex items-center justify-center', {
                    'bg-blue-100': notification.type === 'info',
                    'bg-green-100': notification.type === 'success',
                    'bg-yellow-100': notification.type === 'warning',
                    'bg-red-100': notification.type === 'error'
                  })}>
                    {notification.type === 'info' && <Info className="h-5 w-5 text-blue-600" />}
                    {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {notification.type === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-600" />}
                    {notification.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <Button variant="ghost" size="sm">Mark as Read</Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
