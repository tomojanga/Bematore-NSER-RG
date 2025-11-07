'use client'

import React, { useState } from 'react'
import { useLieBetAssessment, usePGSIAssessment, useDSM5Assessment, useAssessmentHelpers, useCurrentRiskScore, useMyRiskProfile } from '@/hooks/useAssessments'
import { Card, CardContent, CardHeader, CardTitle, RiskBadge, StatusBadge } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { ClipboardList, AlertCircle, TrendingUp, CheckCircle, Clock, Target } from 'lucide-react'

export default function AssessmentPage() {
  const [currentAssessment, setCurrentAssessment] = useState<'liebet' | 'pgsi' | 'dsm5' | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  
  const { data: currentRisk } = useCurrentRiskScore()
  const { data: riskProfile } = useMyRiskProfile()
  const { formatRiskLevel, getRiskLevelColor, getRecommendations } = useAssessmentHelpers()
  
  // Assessment hooks
  const { startLiebet, questions: liebetQuestions, isStarting: isStartingLiebet, startedSession: liebetSession } = useLieBetAssessment()
  const { startPGSI, questions: pgsiQuestions, isStarting: isStartingPGSI, startedSession: pgsiSession } = usePGSIAssessment()
  const { startDSM5, questions: dsm5Questions, isStarting: isStartingDSM5, startedSession: dsm5Session } = useDSM5Assessment()

  const assessmentTypes = [
    {
      type: 'liebet',
      title: 'Lie/Bet Quick Screen',
      description: '2-question rapid screening (30 seconds)',
      duration: '30 seconds',
      icon: Clock,
      color: 'blue',
      recommended: true
    },
    {
      type: 'pgsi',
      title: 'PGSI Assessment',
      description: 'Problem Gambling Severity Index (3 minutes)',
      duration: '3 minutes',
      icon: ClipboardList,
      color: 'green',
      recommended: currentRisk?.data?.risk_level && ['mild', 'moderate'].includes(currentRisk.data.risk_level)
    },
    {
      type: 'dsm5',
      title: 'DSM-5 Clinical Screen',
      description: 'Comprehensive clinical assessment (10 minutes)',
      duration: '10 minutes',
      icon: Target,
      color: 'orange',
      recommended: currentRisk?.data?.risk_level && ['high', 'severe'].includes(currentRisk.data.risk_level)
    }
  ]

  const getCurrentQuestions = () => {
    switch (currentAssessment) {
      case 'liebet': return liebetQuestions
      case 'pgsi': return pgsiQuestions
      case 'dsm5': return dsm5Questions
      default: return []
    }
  }

  const getCurrentSession = () => {
    switch (currentAssessment) {
      case 'liebet': return liebetSession
      case 'pgsi': return pgsiSession
      case 'dsm5': return dsm5Session
      default: return null
    }
  }

  const startAssessment = (type: 'liebet' | 'pgsi' | 'dsm5') => {
    setCurrentAssessment(type)
    setCurrentQuestionIndex(0)
    setResponses({})
    
    switch (type) {
      case 'liebet': startLiebet(); break
      case 'pgsi': startPGSI(); break
      case 'dsm5': startDSM5(); break
    }
  }

  const handleResponse = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const nextQuestion = () => {
    const questions = getCurrentQuestions()
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Assessment complete - submit responses
      completAssessment()
    }
  }

  const completAssessment = async () => {
    // Submit responses and calculate risk score
    // This would integrate with the backend
    setCurrentAssessment(null)
    setCurrentQuestionIndex(0)
    setResponses({})
  }

  // Current Risk Status Display
  const renderCurrentRiskStatus = () => (
    <Card>
      <CardHeader>
        <CardTitle>Your Current Risk Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="mb-2">
              <RiskBadge riskLevel={currentRisk?.data?.risk_level || 'unknown'} />
            </div>
            <p className="text-sm text-gray-600">Current Risk Level</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {currentRisk?.data?.risk_score || 0}
            </div>
            <p className="text-sm text-gray-600">Risk Score</p>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-900 mb-2">
              {currentRisk?.data?.score_date ? 
                new Date(currentRisk.data.score_date).toLocaleDateString() : 
                'No assessment'
              }
            </div>
            <p className="text-sm text-gray-600">Last Assessment</p>
          </div>
        </div>

        {currentRisk?.data?.risk_level && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Recommendations for You</h4>
            <ul className="space-y-1 text-sm text-blue-700">
              {getRecommendations(currentRisk.data.risk_level).map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )

  // Assessment Selection
  const renderAssessmentSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <ClipboardList className="h-16 w-16 mx-auto text-blue-600 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900">Risk Assessment Center</h1>
        <p className="text-gray-600 mt-2">
          Regular self-assessment helps identify potential gambling risks early
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {assessmentTypes.map((assessment) => (
          <Card key={assessment.type} className="relative">
            {assessment.recommended && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                Recommended
              </div>
            )}
            
            <CardContent className="p-6 text-center">
              <assessment.icon className={cn('h-12 w-12 mx-auto mb-4', {
                'text-blue-600': assessment.color === 'blue',
                'text-green-600': assessment.color === 'green',
                'text-orange-600': assessment.color === 'orange'
              })} />
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {assessment.title}
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                {assessment.description}
              </p>
              
              <div className="text-sm text-gray-500 mb-4">
                Duration: {assessment.duration}
              </div>
              
              <Button
                onClick={() => startAssessment(assessment.type as 'liebet' | 'pgsi' | 'dsm5')}
                variant={assessment.recommended ? 'primary' : 'outline'}
                className="w-full"
                loading={
                  (assessment.type === 'liebet' && isStartingLiebet) ||
                  (assessment.type === 'pgsi' && isStartingPGSI) ||
                  (assessment.type === 'dsm5' && isStartingDSM5)
                }
              >
                Take Assessment
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {riskProfile?.data && (
        <Card>
          <CardHeader>
            <CardTitle>Your Assessment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskProfile.data.assessments?.slice(0, 5).map((assessment: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {assessment.assessment_type.toUpperCase()} Assessment
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(assessment.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <RiskBadge riskLevel={assessment.risk_level} />
                    <p className="text-xs text-gray-500 mt-1">
                      Score: {assessment.raw_score}/10
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  // Active Assessment Interface
  const renderActiveAssessment = () => {
    const questions = getCurrentQuestions()
    const session = getCurrentSession()
    const currentQuestion = questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100

    if (!currentQuestion) {
      return <div>Loading question...</div>
    }

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {currentAssessment?.toUpperCase()} Assessment
          </h1>
          <p className="text-gray-600 mt-1">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>

        <ProgressBar value={progress} label="Assessment Progress" />

        <Card>
          <CardContent className="p-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {currentQuestion.question_text_en}
              </h2>

              {/* Response Options */}
              <div className="space-y-3">
                {currentQuestion.response_options?.options?.map((option: any, index: number) => (
                  <label 
                    key={index}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name={`question_${currentQuestion.id}`}
                      value={option.value}
                      onChange={(e) => handleResponse(currentQuestion.id, e.target.value)}
                      checked={responses[currentQuestion.id] === option.value}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-900">{option.label}</span>
                  </label>
                )) || (
                  // Yes/No questions
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name={`question_${currentQuestion.id}`}
                        value="yes"
                        onChange={(e) => handleResponse(currentQuestion.id, e.target.value)}
                        checked={responses[currentQuestion.id] === 'yes'}
                        className="mr-3"
                      />
                      <span className="text-sm text-gray-900">Yes</span>
                    </label>
                    
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name={`question_${currentQuestion.id}`}
                        value="no"
                        onChange={(e) => handleResponse(currentQuestion.id, e.target.value)}
                        checked={responses[currentQuestion.id] === 'no'}
                        className="mr-3"
                      />
                      <span className="text-sm text-gray-900">No</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentAssessment(null)
                  setCurrentQuestionIndex(0)
                  setResponses({})
                }}
                className="flex-1"
              >
                Cancel Assessment
              </Button>
              
              <Button
                onClick={nextQuestion}
                disabled={!responses[currentQuestion.id]}
                className="flex-1"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Assessment'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        <div className="flex justify-center">
          <div className="flex gap-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={cn('h-2 w-8 rounded-full', {
                  'bg-blue-600': index <= currentQuestionIndex,
                  'bg-gray-200': index > currentQuestionIndex
                })}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show assessment interface if one is active
  if (currentAssessment) {
    return renderActiveAssessment()
  }

  // Show overview and selection
  return (
    <div className="space-y-6">
      {/* Current Risk Status */}
      {currentRisk?.data && renderCurrentRiskStatus()}

      {/* Assessment Selection */}
      {renderAssessmentSelection()}

      {/* Why Take Assessments */}
      <Card>
        <CardHeader>
          <CardTitle>Why Take Regular Assessments?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <AlertCircle className="h-12 w-12 mx-auto text-yellow-600 mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Early Detection</h4>
              <p className="text-sm text-gray-600">
                Identify potential gambling problems before they become serious
              </p>
            </div>
            
            <div className="text-center p-4">
              <TrendingUp className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Track Progress</h4>
              <p className="text-sm text-gray-600">
                Monitor your gambling behavior and risk levels over time
              </p>
            </div>
            
            <div className="text-center p-4">
              <CheckCircle className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Get Support</h4>
              <p className="text-sm text-gray-600">
                Receive personalized recommendations and support resources
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Notice */}
      <Card>
        <CardContent className="p-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Legal Notice</h4>
            <p className="text-sm text-gray-700">
              These assessments are for informational and self-monitoring purposes only. 
              They do not constitute professional medical or psychological advice. 
              If you are experiencing serious gambling-related problems, please consult 
              with a qualified healthcare professional.
            </p>
            <p className="text-sm text-gray-700 mt-2">
              All assessment data is confidential and protected under Kenya's Data Protection Act 2019.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}