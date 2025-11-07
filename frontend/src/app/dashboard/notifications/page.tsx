'use client'

import { useNotifications, useNotificationStats } from '@/hooks/useNotifications'
import { Bell, Mail, MessageSquare, CheckCircle, Eye } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

export default function NotificationsPage() {
  const { notifications, unread, markAsRead, markAllAsRead, isLoading } = useNotifications()
  const { data: stats } = useNotificationStats()

  const getChannelIcon = (channel: string) => {
    const icons: Record<string, any> = {
      email: Mail,
      sms: MessageSquare,
      push: Bell,
    }
    const Icon = icons[channel] || Bell
    return Icon
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'border-l-red-500 bg-red-50',
      medium: 'border-l-yellow-500 bg-yellow-50',
      low: 'border-l-blue-500 bg-blue-50',
    }
    return colors[priority] || 'border-l-gray-500 bg-gray-50'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            Manage system notifications and alerts - {unread} unread
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <CheckCircle className="h-5 w-5" />
            Mark All Read
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.today_count || notifications.length}</p>
            </div>
            <Bell className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Unread</p>
              <p className="text-2xl font-bold text-blue-900">{unread}</p>
            </div>
            <Eye className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Email Sent</p>
              <p className="text-2xl font-bold text-green-900">{stats?.email_count || 0}</p>
            </div>
            <Mail className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700">SMS Sent</p>
              <p className="text-2xl font-bold text-purple-900">{stats?.sms_count || 0}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => {
              const ChannelIcon = getChannelIcon(notification.channel)
              const isUnread = !notification.read_at

              return (
                <div
                  key={notification.id}
                  className={`p-6 border-l-4 transition-colors ${
                    isUnread ? getPriorityColor(notification.priority) : 'border-l-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      isUnread ? 'bg-white' : 'bg-gray-100'
                    }`}>
                      <ChannelIcon className={`h-5 w-5 ${
                        isUnread ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className={`font-semibold ${
                            isUnread ? 'text-gray-900' : 'text-gray-600'
                          }`}>
                            {notification.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              notification.notification_type === 'alert' ? 'bg-red-100 text-red-700' :
                              notification.notification_type === 'info' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {notification.notification_type}
                            </span>
                            <span className="text-xs text-gray-500">
                              via {notification.channel.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDateTime(notification.created_at)}
                            </span>
                          </div>
                        </div>
                        {isUnread && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-sm text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>

                      <p className={`text-sm ${
                        isUnread ? 'text-gray-700' : 'text-gray-500'
                      }`}>
                        {notification.message}
                      </p>

                      {notification.read_at && (
                        <p className="text-xs text-gray-400 mt-2">
                          Read at {formatDateTime(notification.read_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
