'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FileText, AlertCircle, Loader2 } from 'lucide-react'
import { api } from '@/lib/api-client'
import { toast } from 'react-hot-toast'

interface Question {
  id: string
  question_text: string
  response_type: string
  response_options: any
}

interface Session {
  id: string
  session_reference: string
  assessment_type: string
}

export default function AssessmentsPage() {
  const [activeAssessment, setActiveAssessment] = useState<string | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const assessments = [
    {
      id: 'liebet',
      name: 'Lie/Bet Screening',
      description: '2 quick questions to assess gambling behavior',
      questions: 2,
      duration: '1 min'
    },
    {
      id: 'pgsi',
      name: 'PGSI Assessment',
      description: 'Problem Gambling Severity Index - 9 questions',
      questions: 9,
      duration: '5 mins'
    },
    {
      id: 'dsm5',
      name: 'DSM-5 Assessment',
      description: 'Comprehensive gambling disorder screening',
      questions: 9,
      duration: '5 mins'
    }
  ]

  const liebetQuestions = [
    {
      text: 'Have you ever had to lie to people important to you about how much you gambled?',
      options: ['No', 'Yes']
    },
    {
      text: 'Have you ever felt the need to bet more and more money?',
      options: ['No', 'Yes']
    }
  ]

  const startAssessment = async (type: string) => {
    setLoading(true)
    try {
      const endpoint = type === 'liebet' ? '/screening/liebet/start/' : 
                      type === 'pgsi' ? '/screening/pgsi/start/' : 
                      '/screening/dsm5/start/'
      
      const response = await api.post(endpoint)
      console.log('Assessment response:', response)
      
      // Handle nested data structure
      const sessionData = response.data?.data?.session || response.data?.session
      const questionsData = response.data?.data?.questions || response.data?.questions
      
      if (!sessionData || !questionsData) {
        throw new Error('Invalid response structure')
      }
      
      setSession(sessionData)
      setQuestions(questionsData)
      setActiveAssessment(type)
      setCurrentQuestion(0)
      toast.success('Assessment started')
    } catch (error: any) {
      console.error('Failed to start assessment:', error)
      toast.error(error.response?.data?.error?.message || 'Failed to start assessment')
    } finally {
      setLoading(false)
    }
  }

  const submitAnswer = async (responseValue: string) => {
    if (!session || !questions[currentQuestion]) return
    
    setSubmitting(true)
    try {
      await api.post('/screening/respond/', {
        session_id: session.id,
        question_id: questions[currentQuestion].id,
        response_value: responseValue
      })
      
      // Move to next question or complete
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        await completeAssessment()
      }
    } catch (error: any) {
      console.error('Failed to submit answer:', error)
      toast.error(error.response?.data?.error?.response_value?.[0] || 'Failed to submit answer')
    } finally {
      setSubmitting(false)
    }
  }

  const completeAssessment = async () => {
    if (!session) return
    
    try {
      await api.post(`/screening/sessions/${session.id}/complete/`)
      toast.success('Assessment completed! Check your dashboard for results.')
      setActiveAssessment(null)
      setSession(null)
      setQuestions([])
      setCurrentQuestion(0)
    } catch (error: any) {
      console.error('Failed to complete assessment:', error)
      toast.error('Failed to complete assessment')
    }
  }

  if (activeAssessment && questions && questions.length > 0) {
    const question = questions[currentQuestion]
    const progress = ((currentQuestion + 1) / questions.length) * 100

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {assessments.find(a => a.id === activeAssessment)?.name}
          </h1>
          <div className="flex items-center justify-between mt-2">
            <p className="text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </p>
            <p className="text-sm text-gray-500">{Math.round(progress)}% complete</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-lg font-medium text-gray-900">{question.question_text}</p>
              </div>
              
              <div className="space-y-3">
                {question?.response_options?.options?.map((option: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => submitAnswer(option.value)}
                    disabled={submitting}
                    className="w-full p-4 text-left border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
                  >
                    <span>{option?.label || option?.value}</span>
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          onClick={() => {
            setActiveAssessment(null)
            setSession(null)
            setQuestions([])
            setCurrentQuestion(0)
          }}
          disabled={submitting}
          className="w-full"
        >
          Cancel Assessment
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Risk Assessments</h1>
        <p className="text-gray-600 mt-1">Take a self-assessment to understand your gambling behavior</p>
      </div>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">Confidential Assessment</p>
              <p className="text-sm text-yellow-700 mt-1">
                Your responses are confidential and used only to provide you with appropriate support.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {assessments.map((assessment) => (
          <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{assessment.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{assessment.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>{assessment.questions} questions</span>
                <span>{assessment.duration}</span>
              </div>
              <Button
                onClick={() => startAssessment(assessment.id)}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Starting...
                  </>
                ) : (
                  'Start Assessment'
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
