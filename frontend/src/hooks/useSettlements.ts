import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { 
  Transaction, 
  Invoice,
  ApiResponse, 
  SingleApiResponse,
  PaginatedParams,
  Currency
} from '@/types'

// Simple toast replacement until we add react-hot-toast
const toast = {
  success: (message: string) => console.log('✅', message),
  error: (message: string) => console.error('❌', message),
  info: (message: string) => console.log('ℹ️', message),
  warning: (message: string) => console.warn('⚠️', message),
}

// Main settlements hook
export function useSettlements(params?: PaginatedParams) {
  const queryClient = useQueryClient()

  // Transactions query
  const { data: transactionsData, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['transactions', params],
    queryFn: async () => {
      const { data } = await api.settlements.transactions(params)
      return data as ApiResponse<Transaction>
    },
    staleTime: 30000, // 30 seconds
  })

  // Invoices query
  const { data: invoicesData, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['invoices', params],
    queryFn: async () => {
      const { data } = await api.settlements.invoices(params)
      return data as ApiResponse<Invoice>
    },
    staleTime: 30000, // 30 seconds
  })

  // Initiate transaction mutation
  const initiateTransactionMutation = useMutation({
    mutationFn: async (data: {
      operator_id: string
      transaction_type: 'screening_fee' | 'license_fee' | 'monthly_subscription' | 'penalty' | 'refund'
      amount: number
      currency?: Currency
      payment_method: 'mpesa' | 'bank_transfer' | 'card' | 'wallet'
      description?: string
      metadata?: Record<string, any>
    }) => {
      const result = await api.settlements.initiate(data)
      return result.data as SingleApiResponse<Transaction>
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['settlement-statistics'] })
      toast.success(response.message || 'Transaction initiated successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to initiate transaction'
      toast.error(message)
    }
  })

  // Complete transaction mutation
  const completeTransactionMutation = useMutation({
    mutationFn: async (data: {
      id: string
      payment_reference?: string
      amount_paid?: number
    }) => {
      const { id, ...completeData } = data
      const result = await api.post(`/settlements/transactions/${id}/complete/`, completeData)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success(response.message || 'Transaction completed successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to complete transaction'
      toast.error(message)
    }
  })

  // Cancel transaction mutation
  const cancelTransactionMutation = useMutation({
    mutationFn: async (data: {
      id: string
      reason?: string
    }) => {
      const { id, ...cancelData } = data
      const result = await api.post(`/settlements/transactions/${id}/cancel/`, cancelData)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success(response.message || 'Transaction cancelled successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to cancel transaction'
      toast.error(message)
    }
  })

  // Refund transaction mutation
  const refundTransactionMutation = useMutation({
    mutationFn: async (data: {
      id: string
      refund_amount?: number
      reason: string
    }) => {
      const { id, ...refundData } = data
      const result = await api.post(`/settlements/transactions/${id}/refund/`, refundData)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success(response.message || 'Refund processed successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to process refund'
      toast.error(message)
    }
  })

  return {
    // Data
    transactions: transactionsData?.results || [],
    invoices: invoicesData?.results || [],
    totalTransactions: transactionsData?.count || 0,
    totalInvoices: invoicesData?.count || 0,
    
    // Loading states
    isLoadingTransactions,
    isLoadingInvoices,
    
    // Mutations
    initiateTransaction: initiateTransactionMutation.mutate,
    completeTransaction: completeTransactionMutation.mutate,
    cancelTransaction: cancelTransactionMutation.mutate,
    refundTransaction: refundTransactionMutation.mutate,
    
    // Loading states for mutations
    isInitiating: initiateTransactionMutation.isPending,
    isCompleting: completeTransactionMutation.isPending,
    isCancelling: cancelTransactionMutation.isPending,
    isRefunding: refundTransactionMutation.isPending,
  }
}

// M-Pesa specific hooks
export function useMPesaPayments() {
  const queryClient = useQueryClient()

  // M-Pesa STK Push (Customer to Business)
  const stkPushMutation = useMutation({
    mutationFn: async (data: {
      phone_number: string
      amount: number
      account_reference: string
      transaction_desc: string
    }) => {
      const result = await api.settlements.mpesaSTK(data)
      return result.data
    },
    onSuccess: (response) => {
      toast.info('M-Pesa payment request sent to your phone')
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'M-Pesa payment failed'
      toast.error(message)
    }
  })

  // M-Pesa B2B (Business to Business)
  const b2bPaymentMutation = useMutation({
    mutationFn: async (data: {
      receiving_party_public_name: string
      amount: number
      account_reference: string
      transaction_desc: string
    }) => {
      const result = await api.settlements.mpesaB2B(data)
      return result.data
    },
    onSuccess: (response) => {
      toast.success('B2B payment initiated successfully')
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'B2B payment failed'
      toast.error(message)
    }
  })

  // Query M-Pesa transaction status
  const queryTransactionStatusMutation = useMutation({
    mutationFn: async (data: {
      checkout_request_id: string
    }) => {
      const result = await api.post('/settlements/mpesa/query/', data)
      return result.data
    },
    onSuccess: (response) => {
      const status = response.data?.result_code
      if (status === '0') {
        toast.success('Payment successful')
      } else {
        toast.warning('Payment pending or failed')
      }
    }
  })

  return {
    stkPush: stkPushMutation.mutate,
    b2bPayment: b2bPaymentMutation.mutate,
    queryTransactionStatus: queryTransactionStatusMutation.mutate,
    isStkPushing: stkPushMutation.isPending,
    isB2bProcessing: b2bPaymentMutation.isPending,
    isQuerying: queryTransactionStatusMutation.isPending,
  }
}

// Invoice management hook
export function useInvoices(params?: PaginatedParams) {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', params],
    queryFn: async () => {
      const { data } = await api.settlements.invoices(params)
      return data as ApiResponse<Invoice>
    },
    staleTime: 30000,
  })

  // Generate invoice mutation
  const generateInvoiceMutation = useMutation({
    mutationFn: async (data: {
      operator_id: string
      billing_period_start: string
      billing_period_end: string
      line_items: Array<{
        description: string
        quantity: number
        unit_price: number
        amount: number
      }>
    }) => {
      const result = await api.settlements.generateInvoice(data)
      return result.data as SingleApiResponse<Invoice>
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success(response.message || 'Invoice generated successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to generate invoice'
      toast.error(message)
    }
  })

  // Send invoice mutation
  const sendInvoiceMutation = useMutation({
    mutationFn: async (data: {
      id: string
      email_addresses?: string[]
      include_pdf?: boolean
    }) => {
      const { id, ...sendData } = data
      const result = await api.post(`/settlements/invoices/${id}/send/`, sendData)
      return result.data
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Invoice sent successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to send invoice'
      toast.error(message)
    }
  })

  // Mark invoice as paid
  const markInvoicePaidMutation = useMutation({
    mutationFn: async (data: {
      id: string
      payment_reference: string
      paid_amount: number
      payment_date?: string
    }) => {
      const { id, ...paidData } = data
      const result = await api.post(`/settlements/invoices/${id}/mark-paid/`, paidData)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success(response.message || 'Invoice marked as paid')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to mark invoice as paid'
      toast.error(message)
    }
  })

  return {
    // Data
    invoices: data?.results || [],
    total: data?.count || 0,
    
    // Loading states
    isLoading,
    
    // Mutations
    generateInvoice: generateInvoiceMutation.mutate,
    sendInvoice: sendInvoiceMutation.mutate,
    markInvoicePaid: markInvoicePaidMutation.mutate,
    
    // Loading states for mutations
    isGenerating: generateInvoiceMutation.isPending,
    isSending: sendInvoiceMutation.isPending,
    isMarkingPaid: markInvoicePaidMutation.isPending,
  }
}

// Reconciliation hook
export function useReconciliation() {
  const queryClient = useQueryClient()

  const { data: reconciliations, isLoading } = useQuery({
    queryKey: ['reconciliations'],
    queryFn: async () => {
      const { data } = await api.get('/settlements/reconciliations/')
      return data
    },
    staleTime: 60000, // 1 minute
  })

  // Reconcile payments mutation
  const reconcilePaymentsMutation = useMutation({
    mutationFn: async (data: {
      period_start: string
      period_end: string
      operator_id?: string
    }) => {
      const result = await api.settlements.reconcile(data)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['reconciliations'] })
      toast.success(response.message || 'Reconciliation initiated')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Reconciliation failed'
      toast.error(message)
    }
  })

  // Resolve reconciliation variance
  const resolveVarianceMutation = useMutation({
    mutationFn: async (data: {
      id: string
      resolution_notes: string
      adjustment_amount?: number
    }) => {
      const { id, ...resolveData } = data
      const result = await api.post(`/settlements/reconciliations/${id}/resolve/`, resolveData)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['reconciliations'] })
      toast.success('Variance resolved successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to resolve variance'
      toast.error(message)
    }
  })

  // Get reconciliation variances
  const { data: variances } = useQuery({
    queryKey: ['reconciliation-variances'],
    queryFn: async () => {
      const { data } = await api.get('/settlements/reconciliations/variances/')
      return data
    },
    staleTime: 60000,
  })

  return {
    reconciliations: reconciliations?.results || [],
    variances: variances?.results || [],
    isLoading,
    reconcilePayments: reconcilePaymentsMutation.mutate,
    resolveVariance: resolveVarianceMutation.mutate,
    isReconciling: reconcilePaymentsMutation.isPending,
    isResolving: resolveVarianceMutation.isPending,
  }
}

// Financial reports hook
export function useFinancialReports() {
  const generateReportMutation = useMutation({
    mutationFn: async (data: {
      report_type: 'financial' | 'revenue' | 'operator_billing'
      period_start: string
      period_end: string
      operator_id?: string
      format?: 'pdf' | 'csv' | 'excel'
    }) => {
      let endpoint = '/settlements/reports/financial/'
      if (data.report_type === 'revenue') {
        endpoint = '/settlements/reports/revenue/'
      } else if (data.report_type === 'operator_billing') {
        endpoint = '/settlements/reports/operator-billing/'
      }
      
      const result = await api.post(endpoint, data)
      return result.data
    },
    onSuccess: (response) => {
      toast.success('Report generated successfully')
      
      // Auto-download if file URL is provided
      if (response.data?.file_url) {
        const link = document.createElement('a')
        link.href = response.data.file_url
        link.download = response.data.filename || 'report'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to generate report'
      toast.error(message)
    }
  })

  return {
    generateReport: generateReportMutation.mutate,
    isGenerating: generateReportMutation.isPending,
    reportResult: generateReportMutation.data,
  }
}

// Settlement statistics hook
export function useSettlementStatistics(period: 'today' | 'week' | 'month' | 'quarter' = 'month') {
  return useQuery({
    queryKey: ['settlement-statistics', period],
    queryFn: async () => {
      const { data } = await api.settlements.statistics()
      return data
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,
  })
}

// Revenue statistics hook
export function useRevenueStatistics(period: string = '30d') {
  return useQuery({
    queryKey: ['revenue-statistics', period],
    queryFn: async () => {
      const { data } = await api.get('/settlements/statistics/revenue/', {
        params: { period }
      })
      return data
    },
    refetchInterval: 300000, // 5 minutes
    staleTime: 60000,
  })
}

// Transaction statistics hook
export function useTransactionStatistics() {
  return useQuery({
    queryKey: ['transaction-statistics'],
    queryFn: async () => {
      const { data } = await api.get('/settlements/statistics/transactions/')
      return data
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,
  })
}

// Overdue invoices hook
export function useOverdueInvoices() {
  return useQuery({
    queryKey: ['overdue-invoices'],
    queryFn: async () => {
      const { data } = await api.get('/settlements/invoices/overdue/')
      return data as ApiResponse<Invoice>
    },
    refetchInterval: 300000, // 5 minutes
    staleTime: 60000,
  })
}

// Settlement helpers
export function useSettlementHelpers() {
  const formatAmount = (amount: number, currency: Currency = 'KES'): string => {
    const formatter = new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return formatter.format(amount)
  }

  const formatTransactionType = (type: string): string => {
    const typeMap: Record<string, string> = {
      'screening_fee': 'Screening Fee',
      'license_fee': 'License Fee',
      'monthly_subscription': 'Monthly Subscription',
      'penalty': 'Penalty',
      'refund': 'Refund'
    }
    return typeMap[type] || type
  }

  const formatTransactionStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'pending': 'Pending',
      'completed': 'Completed',
      'failed': 'Failed',
      'refunded': 'Refunded',
      'cancelled': 'Cancelled'
    }
    return statusMap[status] || status
  }

  const getTransactionStatusColor = (status: string): 'blue' | 'green' | 'red' | 'yellow' | 'gray' => {
    const colorMap: Record<string, 'blue' | 'green' | 'red' | 'yellow' | 'gray'> = {
      'pending': 'blue',
      'completed': 'green',
      'failed': 'red',
      'refunded': 'yellow',
      'cancelled': 'gray'
    }
    return colorMap[status] || 'gray'
  }

  const formatPaymentMethod = (method: string): string => {
    const methodMap: Record<string, string> = {
      'mpesa': 'M-Pesa',
      'bank_transfer': 'Bank Transfer',
      'card': 'Card Payment',
      'wallet': 'Digital Wallet'
    }
    return methodMap[method] || method
  }

  const formatInvoiceStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'draft': 'Draft',
      'issued': 'Issued',
      'paid': 'Paid',
      'overdue': 'Overdue',
      'cancelled': 'Cancelled'
    }
    return statusMap[status] || status
  }

  const getInvoiceStatusColor = (status: string): 'gray' | 'blue' | 'green' | 'red' | 'yellow' => {
    const colorMap: Record<string, 'gray' | 'blue' | 'green' | 'red' | 'yellow'> = {
      'draft': 'gray',
      'issued': 'blue',
      'paid': 'green',
      'overdue': 'red',
      'cancelled': 'yellow'
    }
    return colorMap[status] || 'gray'
  }

  const calculateInvoiceTotal = (lineItems: any[]): number => {
    return lineItems.reduce((total, item) => total + (item.amount || 0), 0)
  }

  const formatDaysOverdue = (dueDate: string): string => {
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = now.getTime() - due.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 0) return 'Not due yet'
    if (diffDays === 1) return '1 day overdue'
    return `${diffDays} days overdue`
  }

  return {
    formatAmount,
    formatTransactionType,
    formatTransactionStatus,
    getTransactionStatusColor,
    formatPaymentMethod,
    formatInvoiceStatus,
    getInvoiceStatusColor,
    calculateInvoiceTotal,
    formatDaysOverdue,
  }
}

// Transaction detail hook
export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const { data } = await api.settlements.getTransaction(id)
      return data as SingleApiResponse<Transaction>
    },
    enabled: !!id,
    staleTime: 30000,
  })
}

// Invoice detail hook
export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const { data } = await api.get(`/settlements/invoices/${id}/`)
      return data as SingleApiResponse<Invoice>
    },
    enabled: !!id,
    staleTime: 30000,
  })
}

// Ledger entries hook
export function useLedgerEntries(params?: PaginatedParams) {
  return useQuery({
    queryKey: ['ledger-entries', params],
    queryFn: async () => {
      const { data } = await api.get('/settlements/ledger/', { params })
      return data
    },
    staleTime: 60000, // 1 minute
  })
}

// Financial overview hook for dashboards
export function useFinancialOverview() {
  return useQuery({
    queryKey: ['financial-overview'],
    queryFn: async () => {
      const [stats, revenue, transactions] = await Promise.all([
        api.settlements.statistics(),
        api.get('/settlements/statistics/revenue/'),
        api.get('/settlements/statistics/transactions/')
      ])

      return {
        general: stats.data,
        revenue: revenue.data,
        transactions: transactions.data,
      }
    },
    refetchInterval: 120000, // 2 minutes
    staleTime: 60000,
  })
}