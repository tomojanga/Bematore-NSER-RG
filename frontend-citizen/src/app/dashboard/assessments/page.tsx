'use client'

import React, { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/Dashboard/DashboardHeader'
import { StatsCard } from '@/components/Dashboard/StatsCard'
import { api } from '@/lib/api-client'
import { useToast } from '@/components/ui/use-toast'
import {
  BarChart3,
  Brain,
  Loader2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Clock
} from 'lucide-react'

interface AssessmentResult {
  id: string
  type: 'LIEBET' | 'PGSI' | 'DSM5'
  score: number
  riskLevel: 'low' | 'medium' | 'high' | 'severe'
  date: string
  recommendations: string[]
  duration?: string
}

type AssessmentType = 'LIEBET' | 'PGSI' | 'DSM5'

interface Question {
  id: string
  text: string
  type: 'multiple_choice' | 'scale'
  options?: { label: string; value: string }[]
  scale?: { min: number; max: number }
}

const ASSESSMENT_TYPES: { type: AssessmentType; name: string; duration: string; description: string }[] = [
  {
    type: 'LIEBET',
    name: 'LIEBET Assessment',
    duration: '5-10 min',
    description: 'Brief assessment of gambling behavior and problem severity'
  },
  {
    type: 'PGSI',
    name: 'PGSI Assessment',
    duration: '10-15 min',
    description: 'Problem Gambling Severity Index - comprehensive screening'
  },
  {
    type: 'DSM5',
    name: 'DSM-5 Criteria',
    duration: '15-20 min',
    description: 'Clinical diagnostic criteria assessment'
  }
]

const RISK_COLORS = {
  low: { bg: 'bg-green-100', text: 'text-green-900', badge: 'bg-green-50' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-900', badge: 'bg-yellow-50' },
  high: { bg: 'bg-red-100', text: 'text-red-900', badge: 'bg-red-50' },
  severe: { bg: 'bg-red-200', text: 'text-red-900', badge: 'bg-red-50' }
}

export default function AssessmentsPage() {
  const { toast } = useToast()
  const [assessments, setAssessments] = useState<AssessmentResult[]>([])
  const [isLoadingAssessments, setIsLoadingAssessments] = useState(true)

  // Fetch previous assessments on mount
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const { data } = await api.get('/screening/assessments/')
        if (data.success && data.data?.items) {
          setAssessments(data.data.items)
        }
      } catch (error) {
        console.error('Failed to fetch assessments:', error)
      } finally {
        setIsLoadingAssessments(false)
      }
    }
    fetchAssessments()
  }, [toast])

  const [startedAssessment, setStartedAssessment] = useState<AssessmentType | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<AssessmentResult | null>(null)

  const handleStartAssessment = async (type: AssessmentType) => {
    setIsLoading(true)
    try {
      const { data } = await api.get(`/screening/questions/${type}/`)
      if (data.success && data.data?.items) {
        setQuestions(data.data.items)
        setStartedAssessment(type)
        setCurrentQuestionIndex(0)
        setAnswers({})
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load assessment',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerQuestion = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      submitAssessment()
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const submitAssessment = async () => {
    if (!startedAssessment) return

    setIsLoading(true)
    try {
      const { data } = await api.post('/screening/calculate-risk/', {
        assessment_type: startedAssessment,
        responses: answers
      })

      if (data.success && data.data) {
        const newResult = {
          id: data.data.id || Date.now().toString(),
          type: startedAssessment,
          score: data.data.score,
          riskLevel: data.data.risk_level,
          date: new Date().toISOString(),
          recommendations: data.data.recommendations || [],
          duration: data.data.duration
        }
        setResults(newResult)
        setAssessments(prev => [newResult, ...prev])
        setShowResults(true)
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit assessment',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Assessment in progress
  if (startedAssessment && !showResults) {
    const currentQuestion = questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <DashboardHeader title="Risk Assessment" subtitle={`${startedAssessment} Assessment`} />

        <main className="max-w-2xl mx-auto px-6 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question */}
            {currentQuestion && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {currentQuestion.text}
                </h2>

                {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option) => (
                      <label key={option.value} className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                        style={{
                          borderColor: answers[currentQuestion.id] === option.value ? '#3b82f6' : '#e5e7eb',
                          backgroundColor: answers[currentQuestion.id] === option.value ? '#eff6ff' : 'white'
                        }}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          value={option.value}
                          checked={answers[currentQuestion.id] === option.value}
                          onChange={(e) => handleAnswerQuestion(currentQuestion.id, e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="ml-3 text-gray-900">{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'scale' && currentQuestion.scale && (
                  <div className="py-6">
                    <div className="flex justify-between mb-4">
                      <span className="text-sm text-gray-600">{currentQuestion.scale.min} - Not at all</span>
                      <span className="text-sm text-gray-600">{currentQuestion.scale.max} - Strongly agree</span>
                    </div>
                    <input
                      type="range"
                      min={currentQuestion.scale.min}
                      max={currentQuestion.scale.max}
                      value={answers[currentQuestion.id] || currentQuestion.scale.min}
                      onChange={(e) => handleAnswerQuestion(currentQuestion.id, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-center mt-4">
                      <span className="text-2xl font-bold text-purple-600">
                        {answers[currentQuestion.id] || currentQuestion.scale.min}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-4 pt-8 border-t border-gray-200">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0 || isLoading}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={!answers[currentQuestion?.id] || isLoading}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : currentQuestionIndex === questions.length - 1 ? (
                  'Submit & See Results'
                ) : (
                  'Next Question'
                )}
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Results
  if (showResults && results) {
    const riskColor = RISK_COLORS[results.riskLevel]

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <DashboardHeader title="Assessment Results" subtitle="Your risk profile" />

        <main className="max-w-3xl mx-auto px-6 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            {/* Score Card */}
            <div className={`${riskColor.badge} border-2 p-8 rounded-xl mb-8`}>
              <div className="text-center mb-6">
                <div className={`${riskColor.bg} rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4`}>
                  <span className={`text-4xl font-bold ${riskColor.text}`}>
                    {results.score}
                  </span>
                </div>
                <h2 className={`text-2xl font-bold ${riskColor.text} capitalize`}>
                  {results.riskLevel} Risk
                </h2>
                <p className="text-gray-600 mt-2">
                  Assessment Date: {new Date(results.date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Interpretation */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">What This Means</h3>
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <p className="text-gray-700">
                  {results.riskLevel === 'low' && 'Your assessment indicates low-risk gambling behavior. Continue healthy habits and monitor your activity.'}
                  {results.riskLevel === 'medium' && 'Your assessment suggests moderate gambling behavior. Consider setting limits and reviewing your habits regularly.'}
                  {results.riskLevel === 'high' && 'Your assessment indicates higher-risk gambling. Professional support is recommended.'}
                  {results.riskLevel === 'severe' && 'Your assessment indicates severe gambling behavior. Immediate professional support is strongly recommended.'}
                </p>
              </div>
            </div>

            {/* Recommendations */}
            {results.recommendations && results.recommendations.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recommendations</h3>
                <div className="space-y-3">
                  {results.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg">
              <h3 className="font-bold text-amber-900 mb-3">Next Steps</h3>
              <ul className="space-y-2 text-sm text-amber-800">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Review your gambling patterns and set spending limits</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Consider talking to a counselor or therapist</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Take another assessment in 30 days to track progress</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setShowResults(false)
                setStartedAssessment(null)
              }}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Back to Assessments
            </button>
            <button
              onClick={() => window.location.href = '/dashboard/help#support'}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Get Professional Help
            </button>
          </div>
        </main>
      </div>
    )
  }

  // Main assessments page
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <DashboardHeader 
        title="Risk Assessments"
        subtitle="Evaluate your gambling behavior"
      />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            icon={BarChart3}
            label="Total Assessments"
            value={assessments.length}
            color="purple"
            description="Completed screenings"
          />
          <StatsCard
            icon={Brain}
            label="Latest Risk Level"
            value={assessments[0]?.riskLevel?.toUpperCase() || 'N/A'}
            color={assessments[0]?.riskLevel === 'high' || assessments[0]?.riskLevel === 'severe' ? 'red' : 'green'}
            description="Current risk profile"
          />
          <StatsCard
            icon={Calendar}
            label="Last Assessment"
            value={assessments[0]?.date ? new Date(assessments[0].date).toLocaleDateString() : 'Never'}
            color="blue"
            description="Most recent screening"
          />
        </div>

        {/* Available Assessments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Assessments</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ASSESSMENT_TYPES.map((assessment) => (
              <div
                key={assessment.type}
                className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 hover:bg-purple-50 transition-all group"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2">{assessment.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{assessment.description}</p>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                  <Clock className="h-4 w-4" />
                  <span>{assessment.duration}</span>
                </div>

                <button
                  onClick={() => handleStartAssessment(assessment.type)}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 group-hover:shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Start Assessment'
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Previous Results */}
        {assessments.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Assessment History</h2>
            <div className="space-y-4">
              {assessments.map((assessment) => {
                const riskColor = RISK_COLORS[assessment.riskLevel]
                return (
                  <div key={assessment.id} className={`${riskColor.badge} border-2 border-current border-opacity-20 p-6 rounded-lg flex items-start justify-between`}>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`font-bold ${riskColor.text}`}>{assessment.type}</h3>
                        <span className={`px-3 py-1 ${riskColor.bg} ${riskColor.text} rounded-full text-xs font-semibold capitalize`}>
                          {assessment.riskLevel} Risk
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {new Date(assessment.date).toLocaleDateString()} • Score: {assessment.score}
                      </p>
                      {assessment.recommendations && assessment.recommendations.length > 0 && (
                        <p className="text-sm text-gray-700">
                          Key recommendations: {assessment.recommendations.slice(0, 2).join(', ')}...
                        </p>
                      )}
                    </div>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors">
                      View Details
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
