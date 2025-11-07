import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { 
  Notification,
  NotificationBatch,
  ApiResponse, 
  SingleApiResponse,
  PaginatedParams 
} from '@/types'

// Simple toast replacement until we add react-hot-toast
const toast = {
  success: (message: string) => console.log('✅', message),
  error: (message: string) => console.error('❌', message),
  info: (message: string) => console.log('ℹ️', message),
}

export function useNotifications(params?: PaginatedParams) {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const { data } = await api.notifications.my(params)
      return data as ApiResponse<Notification>
    },
    staleTime: 30000, // 30 seconds
  })

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await api.notifications.markRead(id)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to mark notification as read'
      toast.error(message)
    }
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const result = await api.notifications.markAllRead()
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] })
      toast.success('All notifications marked as read')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to mark all as read'
      toast.error(message)
    }
  })

  const archiveNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await api.post(`/notifications/${id}/archive/`)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Notification archived')
    },
    onError: (error: any) => {
      toast.error('Failed to archive notification')
    }
  })

  return {
    // Data
    notifications: data?.results || [],
    total: data?.count || 0,
    hasNextPage: !!data?.next,
    hasPreviousPage: !!data?.previous,
    
    // Loading states
    isLoading,
    error,
    
    // Actions
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    archiveNotification: archiveNotificationMutation.mutate,
    
    // Loading states for actions
    isMarkingRead: markAsReadMutation.isPending,
    isMarkingAllRead: markAllAsReadMutation.isPending,
    isArchiving: archiveNotificationMutation.isPending,
  }
}

// Unread notifications hook
export function useUnreadNotifications() {
  return useQuery({
    queryKey: ['unread-notifications'],
    queryFn: async () => {
      const { data } = await api.notifications.unread()
      return data as ApiResponse<Notification>
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000,
  })
}

// Notification preferences hook
export function useNotificationPreferences() {
  const queryClient = useQueryClient()

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const { data } = await api.notifications.preferences()
      return data
    },
    staleTime: 300000, // 5 minutes
  })

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: {
      email_notifications?: boolean
      sms_notifications?: boolean
      push_notifications?: boolean
      in_app_notifications?: boolean
      notification_categories?: {
        security: boolean
        compliance: boolean
        system: boolean
        marketing: boolean
      }
    }) => {
      const result = await api.notifications.updatePreferences(data)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
      toast.success('Notification preferences updated successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update preferences'
      toast.error(message)
    }
  })

  const optOutMutation = useMutation({
    mutationFn: async (data: {
      channel: 'email' | 'sms' | 'push' | 'all'
    }) => {
      const result = await api.post('/notifications/preferences/opt-out/', data)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
      toast.success('Successfully opted out')
    }
  })

  const optInMutation = useMutation({
    mutationFn: async (data: {
      channel: 'email' | 'sms' | 'push' | 'all'
    }) => {
      const result = await api.post('/notifications/preferences/opt-in/', data)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
      toast.success('Successfully opted in')
    }
  })

  return {
    preferences: preferences?.data,
    isLoading,
    updatePreferences: updatePreferencesMutation.mutate,
    optOut: optOutMutation.mutate,
    optIn: optInMutation.mutate,
    isUpdating: updatePreferencesMutation.isPending,
    isOptingOut: optOutMutation.isPending,
    isOptingIn: optInMutation.isPending,
  }
}

// Send notifications hook (admin)
export function useSendNotifications() {
  const queryClient = useQueryClient()

  const sendSMSMutation = useMutation({
    mutationFn: async (data: {
      phone_numbers: string[]
      message: string
      template_id?: string
      scheduled_for?: string
    }) => {
      const result = await api.post('/notifications/send/sms/', data)
      return result.data
    },
    onSuccess: (response) => {
      toast.success(`SMS sent to ${response.data?.sent_count || 0} recipients`)
    }
  })

  const sendEmailMutation = useMutation({
    mutationFn: async (data: {
      email_addresses: string[]
      subject: string
      message: string
      template_id?: string
      scheduled_for?: string
    }) => {
      const result = await api.post('/notifications/send/email/', data)
      return result.data
    },
    onSuccess: (response) => {
      toast.success(`Email sent to ${response.data?.sent_count || 0} recipients`)
    }
  })

  const sendPushMutation = useMutation({
    mutationFn: async (data: {
      user_ids: string[]
      title: string
      message: string
      data?: Record<string, any>
    }) => {
      const result = await api.post('/notifications/send/push/', data)
      return result.data
    },
    onSuccess: (response) => {
      toast.success(`Push notification sent to ${response.data?.sent_count || 0} users`)
    }
  })

  const sendBulkMutation = useMutation({
    mutationFn: async (data: {
      recipient_type: 'all_users' | 'user_ids' | 'roles' | 'operators'
      recipients?: string[]
      channels: Array<'email' | 'sms' | 'push'>
      title: string
      message: string
      template_id?: string
      scheduled_for?: string
    }) => {
      const result = await api.post('/notifications/send/bulk/', data)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['notification-batches'] })
      toast.success('Bulk notification initiated successfully')
    }
  })

  return {
    sendSMS: sendSMSMutation.mutate,
    sendEmail: sendEmailMutation.mutate,
    sendPush: sendPushMutation.mutate,
    sendBulk: sendBulkMutation.mutate,
    isSendingSMS: sendSMSMutation.isPending,
    isSendingEmail: sendEmailMutation.isPending,
    isSendingPush: sendPushMutation.isPending,
    isSendingBulk: sendBulkMutation.isPending,
  }
}

// Notification batches hook
export function useNotificationBatches(params?: PaginatedParams) {
  const queryClient = useQueryClient()

  const { data: batches, isLoading } = useQuery({
    queryKey: ['notification-batches', params],
    queryFn: async () => {
      const { data } = await api.get('/notifications/batches/', { params })
      return data as ApiResponse<NotificationBatch>
    },
    staleTime: 30000,
  })

  const createBatchMutation = useMutation({
    mutationFn: async (data: {
      name: string
      description?: string
      notification_type: string
      channel: 'sms' | 'email' | 'push'
      template: string
      recipients: string[]
      scheduled_for?: string
    }) => {
      const result = await api.post('/notifications/batches/create/', data)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-batches'] })
      toast.success('Notification batch created successfully')
    }
  })

  const sendBatchMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await api.post(`/notifications/batches/${id}/send/`)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-batches'] })
      toast.success('Batch sending initiated')
    }
  })

  const cancelBatchMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await api.post(`/notifications/batches/${id}/cancel/`)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-batches'] })
      toast.success('Batch cancelled successfully')
    }
  })

  return {
    batches: batches?.results || [],
    totalBatches: batches?.count || 0,
    isLoading,
    createBatch: createBatchMutation.mutate,
    sendBatch: sendBatchMutation.mutate,
    cancelBatch: cancelBatchMutation.mutate,
    isCreating: createBatchMutation.isPending,
    isSending: sendBatchMutation.isPending,
    isCancelling: cancelBatchMutation.isPending,
  }
}

// Notification templates hook
export function useNotificationTemplates() {
  const queryClient = useQueryClient()

  const { data: templates, isLoading } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: async () => {
      const { data } = await api.get('/notifications/templates/')
      return data
    },
    staleTime: 300000, // 5 minutes
  })

  const renderTemplateMutation = useMutation({
    mutationFn: async (data: {
      template_code: string
      context?: Record<string, any>
    }) => {
      const result = await api.post(`/notifications/templates/${data.template_code}/render/`, {
        context: data.context
      })
      return result.data
    }
  })

  const testTemplateMutation = useMutation({
    mutationFn: async (data: {
      template_code: string
      test_recipient: string
      context?: Record<string, any>
    }) => {
      const result = await api.post('/notifications/templates/test/', data)
      return result.data
    },
    onSuccess: () => {
      toast.success('Test notification sent successfully')
    }
  })

  return {
    templates: templates?.results || [],
    isLoading,
    renderTemplate: renderTemplateMutation.mutate,
    testTemplate: testTemplateMutation.mutate,
    isRendering: renderTemplateMutation.isPending,
    isTesting: testTemplateMutation.isPending,
    renderedTemplate: renderTemplateMutation.data,
  }
}

// Notification statistics hook
export function useNotificationStatistics() {
  return useQuery({
    queryKey: ['notification-statistics'],
    queryFn: async () => {
      const { data } = await api.notifications.statistics()
      return data
    },
    refetchInterval: 120000, // 2 minutes
    staleTime: 60000,
  })
}

// Delivery tracking hooks
export function useNotificationDeliveryTracking() {
  const { data: emailLogs } = useQuery({
    queryKey: ['email-logs'],
    queryFn: async () => {
      const { data } = await api.get('/notifications/logs/email/')
      return data
    },
    staleTime: 60000,
  })

  const { data: smsLogs } = useQuery({
    queryKey: ['sms-logs'],
    queryFn: async () => {
      const { data } = await api.get('/notifications/logs/sms/')
      return data
    },
    staleTime: 60000,
  })

  const { data: pushLogs } = useQuery({
    queryKey: ['push-logs'],
    queryFn: async () => {
      const { data } = await api.get('/notifications/logs/push/')
      return data
    },
    staleTime: 60000,
  })

  return {
    emailLogs: emailLogs?.results || [],
    smsLogs: smsLogs?.results || [],
    pushLogs: pushLogs?.results || [],
  }
}

// Failed notifications hook
export function useFailedNotifications() {
  const queryClient = useQueryClient()

  const { data: failedNotifications, isLoading } = useQuery({
    queryKey: ['failed-notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications/failed/')
      return data
    },
    staleTime: 60000,
  })

  const retryFailedMutation = useMutation({
    mutationFn: async (data?: {
      notification_ids?: string[]
      max_retry_count?: number
    }) => {
      const result = await api.post('/notifications/retry-failed/', data || {})
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['failed-notifications'] })
      toast.success(`Retrying ${response.data?.retry_count || 0} failed notifications`)
    }
  })

  return {
    failedNotifications: failedNotifications?.results || [],
    isLoading,
    retryFailed: retryFailedMutation.mutate,
    isRetrying: retryFailedMutation.isPending,
  }
}

// Notification delivery rates hook
export function useNotificationDeliveryRates() {
  return useQuery({
    queryKey: ['notification-delivery-rates'],
    queryFn: async () => {
      const { data } = await api.get('/notifications/statistics/delivery-rate/')
      return data
    },
    refetchInterval: 300000, // 5 minutes
    staleTime: 120000,
  })
}

// Notification open rates hook
export function useNotificationOpenRates() {
  return useQuery({
    queryKey: ['notification-open-rates'],
    queryFn: async () => {
      const { data } = await api.get('/notifications/statistics/open-rate/')
      return data
    },
    refetchInterval: 300000, // 5 minutes
    staleTime: 120000,
  })
}

// Notification helpers
export function useNotificationHelpers() {
  const formatChannel = (channel: string): string => {
    const channelMap: Record<string, string> = {
      'sms': 'SMS',
      'email': 'Email', 
      'push': 'Push',
      'in_app': 'In-App'
    }
    return channelMap[channel] || channel
  }

  const formatPriority = (priority: string): string => {
    const priorityMap: Record<string, string> = {
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High',
      'urgent': 'Urgent',
      'critical': 'Critical'
    }
    return priorityMap[priority] || priority
  }

  const getPriorityColor = (priority: string): 'gray' | 'blue' | 'yellow' | 'orange' | 'red' => {
    const colorMap: Record<string, 'gray' | 'blue' | 'yellow' | 'orange' | 'red'> = {
      'low': 'gray',
      'medium': 'blue',
      'high': 'yellow',
      'urgent': 'orange',
      'critical': 'red'
    }
    return colorMap[priority] || 'gray'
  }

  const formatNotificationStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'pending': 'Pending',
      'sent': 'Sent',
      'delivered': 'Delivered',
      'failed': 'Failed',
      'read': 'Read',
      'clicked': 'Clicked'
    }
    return statusMap[status] || status
  }

  const getNotificationStatusColor = (status: string): 'blue' | 'yellow' | 'green' | 'red' | 'purple' => {
    const colorMap: Record<string, 'blue' | 'yellow' | 'green' | 'red' | 'purple'> = {
      'pending': 'blue',
      'sent': 'yellow',
      'delivered': 'green',
      'failed': 'red',
      'read': 'green',
      'clicked': 'purple'
    }
    return colorMap[status] || 'blue'
  }

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date()
    const notificationTime = new Date(timestamp)
    const diffMs = now.getTime() - notificationTime.getTime()
    
    const seconds = Math.floor(diffMs / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  return {
    formatChannel,
    formatPriority,
    getPriorityColor,
    formatNotificationStatus,
    getNotificationStatusColor,
    formatTimeAgo,
  }
}

// Real-time notification updates (WebSocket simulation)
export function useRealTimeNotifications() {
  const queryClient = useQueryClient()

  // Simulate real-time by periodic refetch
  const { data: realtimeData } = useQuery({
    queryKey: ['realtime-notifications'],
    queryFn: async () => {
      const [notifications, statistics] = await Promise.all([
        api.notifications.unread(),
        api.notifications.statistics()
      ])
      
      return {
        unread: notifications.data,
        statistics: statistics.data,
      }
    },
    refetchInterval: 10000, // 10 seconds
    staleTime: 5000,
  })

  // Poll for new notifications
  const pollForNewNotifications = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] })
    queryClient.invalidateQueries({ queryKey: ['unread-notifications'] })
    queryClient.invalidateQueries({ queryKey: ['realtime-notifications'] })
  }

  return {
    realtimeData,
    pollForNewNotifications,
  }
}
