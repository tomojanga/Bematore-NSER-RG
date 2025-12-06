'use client'

import React, { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/Dashboard/DashboardHeader'
import { 
  Bell, 
  Trash2, 
  Check, 
  AlertCircle, 
  Info, 
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react'
import { api } from '@/lib/api-client'
import { useToast } from '@/components/ui/use-toast'

interface Notification {
  id: string
  type: 'alert' | 'info' | 'success' | 'warning'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  notification_type?: string
}

const notificationIcons = {
  alert: AlertCircle,
  info: Info,
  success: CheckCircle,
  warning: Bell
}

const notificationColors = {
  alert: 'bg-red-50 border-red-200 text-red-700',
  info: 'bg-blue-50 border-blue-200 text-blue-700',
  success: 'bg-green-50 border-green-200 text-green-700',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-700'
}

const typeMap: Record<string, 'alert' | 'info' | 'success' | 'warning'> = {
  'exclusion': 'alert',
  'assessment': 'info',
  'verification': 'success',
  'reminder': 'info',
  'warning': 'warning',
  'info': 'info',
  'success': 'success'
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true)
        const { data } = await api.get('/notifications/')
        if (data.success && data.data?.items) {
          const mappedNotifications: Notification[] = data.data.items.map((n: any) => ({
            id: n.id,
            type: typeMap[n.notification_type] || 'info',
            title: n.title,
            message: n.message,
            timestamp: n.created_at,
            read: n.is_read,
            notification_type: n.notification_type,
            actionUrl: n.action_url
          }))
          setNotifications(mappedNotifications)
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
        toast({
          title: 'Error',
          description: 'Failed to load notifications',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [toast])

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.post(`/notifications/${id}/mark-read/`)
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      toast({
        title: 'Error',
        description: 'Failed to update notification',
        variant: 'destructive'
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read/')
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      toast({
        title: 'Success',
        description: 'All notifications marked as read'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark all as read',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}/`)
      setNotifications(prev => prev.filter(n => n.id !== id))
      toast({
        title: 'Success',
        description: 'Notification deleted'
      })
    } catch (error) {
      console.error('Failed to delete notification:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive'
      })
    }
  }

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' ? true : !n.read
  )

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <DashboardHeader 
        title="Notifications"
        subtitle={`You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
      />

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Notifications
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors relative ${
                filter === 'unread' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unread {unreadCount > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>}
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
            >
              <Check className="h-4 w-4" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-white rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
              </p>
              <p className="text-gray-500 text-sm">
                {filter === 'unread' 
                  ? 'You\'re all caught up!' 
                  : 'You don\'t have any notifications yet'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = notificationIcons[notification.type]
              return (
                <div
                  key={notification.id}
                  className={`border-2 rounded-lg p-4 flex items-start gap-4 transition-all ${
                    notificationColors[notification.type]
                  } ${!notification.read ? 'border-current' : 'border-gray-200'}`}
                >
                  <Icon className="h-6 w-6 flex-shrink-0 mt-0.5" />

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-base">{notification.title}</h3>
                      {!notification.read && (
                        <span className="inline-block h-2 w-2 bg-current rounded-full ml-2 mt-1.5 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm opacity-90 mb-3">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs opacity-75 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(notification.timestamp).toLocaleDateString()} at{' '}
                        {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="flex gap-2">
                        {notification.actionUrl && (
                          <a
                            href={notification.actionUrl}
                            className="px-3 py-1 bg-white bg-opacity-50 hover:bg-opacity-100 rounded text-sm font-medium transition-all"
                          >
                            View
                          </a>
                        )}
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="px-3 py-1 bg-white bg-opacity-50 hover:bg-opacity-100 rounded text-sm font-medium transition-all"
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="px-3 py-1 text-red-600 hover:bg-red-100 rounded text-sm font-medium transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
