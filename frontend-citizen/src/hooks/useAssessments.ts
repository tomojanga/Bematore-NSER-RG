import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { 
  AssessmentSession, 
  AssessmentQuestion, 
  AssessmentResponse,
  RiskScore,
  BehavioralProfile,
  ApiResponse, 
  SingleApiResponse,
  PaginatedParams, 
  AssessmentFormData,
  AssessmentType 
} from '@/types'

// Simple toast replacement until we add react-hot-toast
const toast = {
  success: (message: string) => console.log('✅', message),
  error: (message: string) => console.error('❌', message),
  info: (message: string) => console.log('ℹ️', message),
  warning: (message: string) => console.warn('⚠️', message),
}

export function useAssessments(params?: PaginatedParams) {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['assessment-sessions', params],
    queryFn: async () => {
      const { data } = await api.screening.sessions(params)
      return data as ApiResponse<AssessmentSession>
    },
    staleTime: 30000, // 30 seconds
  })

  const startAssessmentMutation = useMutation({
    mutationFn: async (assessmentData: {
      assessment_type: AssessmentType
      language?: string
      operator_id?: string
    }) => {
      const result = await api.screening.start(assessmentData)
      return result.data as SingleApiResponse<{
        session: AssessmentSession
        questions: AssessmentQuestion[]
      }>
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['assessment-sessions'] })
      toast.success(response.message || 'Assessment started successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to start assessment'
      toast.error(message)
    }
  })

  const submitResponseMutation = useMutation({
    mutationFn: async (data: {
      session_id: string
      question_id: string
      response_value: string
    }) => {
      const result = await api.screening.submitResponse(data)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['assessment-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['assessment-responses'] })
      toast.success('Response recorded')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to submit response'
      toast.error(message)
    }
  })

  const batchSubmitResponsesMutation = useMutation({
    mutationFn: async (data: {
      session_id: string
      responses: Array<{
        question_id: string
        response_value: string
      }>
    }) => {
      const result = await api.screening.batchResponses(data)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['assessment-sessions'] })
      toast.success(response.message || `${response.data?.count || 0} responses recorded`)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to submit responses'
      toast.error(message)
    }
  })

  const calculateRiskScoreMutation = useMutation({
    mutationFn: async (data: { session_id: string }) => {
      const result = await api.screening.calculateRisk(data)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['assessment-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['risk-scores'] })
      
      const riskLevel = response.data?.risk_level
      const shouldExclude = response.data?.should_self_exclude
      
      if (shouldExclude) {
        toast.warning(`⚠️ High risk detected (${riskLevel}) - Self-exclusion recommended`)
      } else {
        toast.success(`Risk assessment complete - Level: ${riskLevel}`)
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to calculate risk score'
      toast.error(message)
    }
  })

  return {
    // Data
    sessions: data?.results || [],
    total: data?.count || 0,
    hasNextPage: !!data?.next,
    hasPreviousPage: !!data?.previous,
    
    // Loading states
    isLoading,
    error,
    
    // Mutations
    startAssessment: startAssessmentMutation.mutate,
    submitResponse: submitResponseMutation.mutate,
    batchSubmitResponses: batchSubmitResponsesMutation.mutate,
    calculateRiskScore: calculateRiskScoreMutation.mutate,
    
    // Loading states for mutations
    isStarting: startAssessmentMutation.isPending,
    isSubmitting: submitResponseMutation.isPending,
    isBatchSubmitting: batchSubmitResponsesMutation.isPending,
    isCalculating: calculateRiskScoreMutation.isPending,
    
    // Mutation data
    startedAssessment: startAssessmentMutation.data,
    riskScoreResult: calculateRiskScoreMutation.data,
  }
}

// Hook for individual assessment session
export function useAssessment(id: string) {
  return useQuery({
    queryKey: ['assessment-session', id],
    queryFn: async () => {
      const { data } = await api.get(`/screening/sessions/${id}/`)
      return data as SingleApiResponse<AssessmentSession>
    },
    enabled: !!id,
    staleTime: 30000,
  })
}

// Hook for Lie/Bet assessment
export function useLieBetAssessment() {
  const queryClient = useQueryClient()

  const startMutation = useMutation({
    mutationFn: async () => {
      const result = await api.screening.startLiebet()
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['assessment-sessions'] })
      toast.success('Lie/Bet assessment started')
    }
  })

  const { data: questions } = useQuery({
    queryKey: ['liebet-questions'],
    queryFn: async () => {
      const { data } = await api.screening.questionsByType('liebet')
      return data as SingleApiResponse<AssessmentQuestion[]>
    },
    staleTime: 300000, // 5 minutes (questions don't change often)
  })

  return {
    startLiebet: startMutation.mutate,
    isStarting: startMutation.isPending,
    questions: questions?.data || [],
    startedSession: startMutation.data,
  }
}

// Hook for PGSI assessment
export function usePGSIAssessment() {
  const queryClient = useQueryClient()

  const startMutation = useMutation({
    mutationFn: async () => {
      const result = await api.screening.startPGSI()
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['assessment-sessions'] })
      toast.success('PGSI assessment started')
    }
  })

  const { data: questions } = useQuery({
    queryKey: ['pgsi-questions'],
    queryFn: async () => {
      const { data } = await api.screening.questionsByType('pgsi')
      return data as SingleApiResponse<AssessmentQuestion[]>
    },
    staleTime: 300000, // 5 minutes
  })

  return {
    startPGSI: startMutation.mutate,
    isStarting: startMutation.isPending,
    questions: questions?.data || [],
    startedSession: startMutation.data,
  }
}

// Hook for DSM-5 assessment
export function useDSM5Assessment() {
  const queryClient = useQueryClient()

  const startMutation = useMutation({
    mutationFn: async () => {
      const result = await api.screening.startDSM5()
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['assessment-sessions'] })
      toast.success('DSM-5 assessment started')
    }
  })

  const { data: questions } = useQuery({
    queryKey: ['dsm5-questions'],
    queryFn: async () => {
      const { data } = await api.screening.questionsByType('dsm5')
      return data as SingleApiResponse<AssessmentQuestion[]>
    },
    staleTime: 300000, // 5 minutes
  })

  return {
    startDSM5: startMutation.mutate,
    isStarting: startMutation.isPending,
    questions: questions?.data || [],
    startedSession: startMutation.data,
  }
}

// Hook for assessment questions by type
export function useAssessmentQuestions(assessmentType: AssessmentType) {
  return useQuery({
    queryKey: ['assessment-questions', assessmentType],
    queryFn: async () => {
      const { data } = await api.screening.questionsByType(assessmentType)
      return data as SingleApiResponse<AssessmentQuestion[]>
    },
    enabled: !!assessmentType,
    staleTime: 300000, // 5 minutes
  })
}

// Hook for user's assessments
export function useMyAssessments(params?: PaginatedParams) {
  return useQuery({
    queryKey: ['my-assessments', params],
    queryFn: async () => {
      const { data } = await api.screening.myAssessments()
      return data as ApiResponse<AssessmentSession>
    },
    staleTime: 30000,
  })
}

// Hook for current risk score
export function useCurrentRiskScore() {
  return useQuery({
    queryKey: ['current-risk-score'],
    queryFn: async () => {
      const { data } = await api.screening.currentRisk()
      return data as SingleApiResponse<RiskScore>
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
  })
}

// Hook for risk score history
export function useRiskScoreHistory(params?: PaginatedParams) {
  return useQuery({
    queryKey: ['risk-score-history', params],
    queryFn: async () => {
      const { data } = await api.screening.riskHistory()
      return data as ApiResponse<RiskScore>
    },
    staleTime: 60000, // 1 minute
  })
}

// Hook for user's risk profile
export function useMyRiskProfile() {
  return useQuery({
    queryKey: ['my-risk-profile'],
    queryFn: async () => {
      const { data } = await api.screening.myRiskProfile()
      return data
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
  })
}

// Hook for risk recommendations
export function useRiskRecommendations() {
  return useQuery({
    queryKey: ['risk-recommendations'],
    queryFn: async () => {
      const { data } = await api.screening.recommendations()
      return data
    },
    staleTime: 300000, // 5 minutes
  })
}

// Hook for behavioral profile
export function useBehavioralProfile(userId?: string) {
  return useQuery({
    queryKey: ['behavioral-profile', userId],
    queryFn: async () => {
      const endpoint = userId 
        ? `/screening/behavioral/profile/?user_id=${userId}`
        : '/screening/behavioral/profile/'
      const { data } = await api.get(endpoint)
      return data as SingleApiResponse<BehavioralProfile>
    },
    enabled: true,
    staleTime: 300000, // 5 minutes
  })
}

// Hook for ML risk prediction
export function useMLRiskPrediction() {
  return useMutation({
    mutationFn: async (data: {
      user_id: string
      features?: Record<string, any>
    }) => {
      const result = await api.post('/screening/ml/predict/', data)
      return result.data
    },
    onSuccess: (response) => {
      const prediction = response.data?.predicted_risk_level
      const confidence = response.data?.confidence_score
      toast.info(`ML Prediction: ${prediction} (${Math.round(confidence * 100)}% confidence)`)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'ML prediction failed'
      toast.error(message)
    }
  })
}

// Hook for assessment statistics
export function useAssessmentStatistics() {
  return useQuery({
    queryKey: ['assessment-statistics'],
    queryFn: async () => {
      const { data } = await api.screening.statistics()
      return data
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,
  })
}

// Hook for screening schedules
export function useScreeningSchedules(params?: PaginatedParams) {
  return useQuery({
    queryKey: ['screening-schedules', params],
    queryFn: async () => {
      const { data } = await api.get('/screening/schedules/', { params })
      return data
    },
    staleTime: 60000, // 1 minute
  })
}

// Hook for due screenings (admin)
export function useDueScreenings() {
  return useQuery({
    queryKey: ['due-screenings'],
    queryFn: async () => {
      const { data } = await api.get('/screening/schedule/due/')
      return data
    },
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 60000,
  })
}

// Hook for overdue screenings (admin)
export function useOverdueScreenings() {
  return useQuery({
    queryKey: ['overdue-screenings'],
    queryFn: async () => {
      const { data } = await api.get('/screening/schedule/overdue/')
      return data
    },
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 60000,
  })
}

// Comprehensive assessment management hook
export function useAssessmentManager(sessionId?: string) {
  const queryClient = useQueryClient()

  // Get session details
  const { data: session } = useQuery({
    queryKey: ['assessment-session', sessionId],
    queryFn: async () => {
      if (!sessionId) return null
      const { data } = await api.get(`/screening/sessions/${sessionId}/`)
      return data as SingleApiResponse<AssessmentSession>
    },
    enabled: !!sessionId,
    staleTime: 10000, // 10 seconds
  })

  // Submit assessment
  const submitAssessmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await api.post(`/screening/sessions/${id}/submit/`)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['assessment-sessions'] })
      toast.success('Assessment submitted successfully')
    }
  })

  // Complete assessment
  const completeAssessmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await api.post(`/screening/sessions/${id}/complete/`)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['assessment-sessions'] })
      toast.success('Assessment completed successfully')
    }
  })

  // Abandon assessment
  const abandonAssessmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await api.post(`/screening/sessions/${id}/abandon/`)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['assessment-sessions'] })
      toast.info('Assessment abandoned')
    }
  })

  return {
    session: session?.data,
    submitAssessment: submitAssessmentMutation.mutate,
    completeAssessment: completeAssessmentMutation.mutate,
    abandonAssessment: abandonAssessmentMutation.mutate,
    isSubmitting: submitAssessmentMutation.isPending,
    isCompleting: completeAssessmentMutation.isPending,
    isAbandoning: abandonAssessmentMutation.isPending,
  }
}

// Hook for risk score management
export function useRiskScores(params?: PaginatedParams) {
  return useQuery({
    queryKey: ['risk-scores', params],
    queryFn: async () => {
      const { data } = await api.get('/screening/risk-scores/', { params })
      return data as ApiResponse<RiskScore>
    },
    staleTime: 60000, // 1 minute
  })
}

// Hook for risk trends
export function useRiskTrends() {
  return useQuery({
    queryKey: ['risk-trends'],
    queryFn: async () => {
      const { data } = await api.get('/screening/risk/trends/')
      return data
    },
    staleTime: 300000, // 5 minutes
  })
}

// Hook for screening completion rate
export function useScreeningCompletionRate() {
  return useQuery({
    queryKey: ['screening-completion-rate'],
    queryFn: async () => {
      const { data } = await api.get('/screening/statistics/completion-rate/')
      return data
    },
    refetchInterval: 300000, // 5 minutes
    staleTime: 60000,
  })
}

// Hook for risk distribution
export function useRiskDistribution() {
  return useQuery({
    queryKey: ['risk-distribution'],
    queryFn: async () => {
      const { data } = await api.get('/screening/statistics/risk-distribution/')
      return data
    },
    refetchInterval: 300000, // 5 minutes
    staleTime: 60000,
  })
}

// Assessment helper functions
export function useAssessmentHelpers() {
  const formatRiskLevel = (level: string): string => {
    const levelMap: Record<string, string> = {
      'none': 'No Risk',
      'low': 'Low Risk',
      'mild': 'Mild Risk',
      'moderate': 'Moderate Risk',
      'high': 'High Risk',
      'severe': 'Severe Risk',
      'critical': 'Critical Risk',
      'blacklisted': 'Blacklisted'
    }
    return levelMap[level] || level
  }

  const getRiskLevelColor = (level: string): 'green' | 'yellow' | 'orange' | 'red' | 'purple' => {
    const colorMap: Record<string, 'green' | 'yellow' | 'orange' | 'red' | 'purple'> = {
      'none': 'green',
      'low': 'green',
      'mild': 'yellow',
      'moderate': 'yellow',
      'high': 'orange',
      'severe': 'red',
      'critical': 'red',
      'blacklisted': 'purple'
    }
    return colorMap[level] || 'yellow'
  }

  const formatAssessmentType = (type: string): string => {
    const typeMap: Record<string, string> = {
      'liebet': 'Lie/Bet (2-Question Screen)',
      'pgsi': 'PGSI (Problem Gambling Severity Index)',
      'dsm5': 'DSM-5 (Clinical Assessment)',
      'behavioral': 'Behavioral Analysis',
      'custom': 'Custom Assessment'
    }
    return typeMap[type] || type
  }

  const formatAssessmentStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'abandoned': 'Abandoned',
      'expired': 'Expired'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string): 'blue' | 'green' | 'gray' | 'red' => {
    const colorMap: Record<string, 'blue' | 'green' | 'gray' | 'red'> = {
      'in_progress': 'blue',
      'completed': 'green',
      'abandoned': 'gray',
      'expired': 'red'
    }
    return colorMap[status] || 'gray'
  }

  const shouldTriggerSelfExclusion = (riskLevel: string): boolean => {
    return ['high', 'severe', 'critical', 'blacklisted'].includes(riskLevel)
  }

  const getRecommendations = (riskLevel: string): string[] => {
    const recommendations: Record<string, string[]> = {
      'none': [
        'Continue practicing responsible gambling',
        'Set personal betting limits',
        'Take regular breaks from gambling'
      ],
      'low': [
        'Monitor your gambling habits',
        'Set spending limits',
        'Take regular breaks',
        'Consider using time limits'
      ],
      'mild': [
        'Consider setting stricter limits',
        'Seek guidance if concerned',
        'Use responsible gambling tools',
        'Monitor spending patterns closely'
      ],
      'moderate': [
        'Strongly recommend setting firm limits',
        'Consider professional guidance',
        'Use self-exclusion tools if needed',
        'Monitor behavior weekly'
      ],
      'high': [
        'Self-exclusion strongly recommended',
        'Seek professional help immediately',
        'Contact support services',
        'Set strict financial controls'
      ],
      'severe': [
        'Immediate self-exclusion recommended',
        'Professional help essential',
        'Contact crisis helpline',
        'Remove access to funds'
      ],
      'critical': [
        'URGENT: Seek immediate professional help',
        'Self-exclude immediately',
        'Emergency support required',
        'Contact family/support network'
      ]
    }
    return recommendations[riskLevel] || recommendations['none']
  }

  return {
    formatRiskLevel,
    getRiskLevelColor,
    formatAssessmentType,
    formatAssessmentStatus,
    getStatusColor,
    shouldTriggerSelfExclusion,
    getRecommendations,
  }
}

// Combined assessment flow hook
export function useAssessmentFlow() {
  const queryClient = useQueryClient()
  
  const completeFlowMutation = useMutation({
    mutationFn: async (data: {
      assessment_type: AssessmentType
      responses: Array<{
        question_id: string
        response_value: string
      }>
      language?: string
    }) => {
      // Start assessment
      const sessionResult = await api.screening.start({
        assessment_type: data.assessment_type,
        language: data.language
      })
      
      const session = sessionResult.data.data.session
      
      // Submit all responses
      await api.screening.batchResponses({
        session_id: session.id,
        responses: data.responses
      })
      
      // Calculate risk score
      const riskResult = await api.screening.calculateRisk({
        session_id: session.id
      })
      
      return {
        session,
        riskScore: riskResult.data.data
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['assessment-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['risk-scores'] })
      
      const riskLevel = result.riskScore.risk_level
      const shouldExclude = result.riskScore.should_self_exclude
      
      if (shouldExclude) {
        toast.warning(`⚠️ Assessment complete - High risk (${riskLevel}). Self-exclusion recommended.`)
      } else {
        toast.success(`✅ Assessment complete - Risk level: ${riskLevel}`)
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Assessment flow failed'
      toast.error(message)
    }
  })

  return {
    completeAssessmentFlow: completeFlowMutation.mutate,
    isProcessingFlow: completeFlowMutation.isPending,
    flowResult: completeFlowMutation.data,
  }
}
