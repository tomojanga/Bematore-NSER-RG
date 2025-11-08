'use client'

import { useState } from 'react'
import { useAssessments } from '@/hooks/useAssessments'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FileText, AlertCircle, CheckCircle } from 'lucide-react'

export default function AssessmentsPage() {
  const { data: assessments } = useAssessments()
  const [activeAssessment, setActiveAssessment] = useState<string | null>(null)
  const [responses, setResponses] = useState<Record<string, number>>({})

  const assessmentTypes = [
    {
      id: 'liebet',
      name: 'Lie/Bet Questionnaire',
      duration: '2 minutes',
      description: 'Quick 2-question screening',
      questions: [
        'Have you ever felt the need to bet more and more money?',
        'Have you ever had to lie about how much you gamble?'
      ]
    },
    {
      id: 'pgsi',
      name: 'PGSI Assessment',
      duration: '5 minutes',
      description: 'Problem Gambling Severity Index (9 questions)',
      questions: []
    },
    {
      id: 'dsm5',
      name: 'DSM-5 Criteria',
      duration: '10 minutes',
      description: 'Comprehensive diagnostic assessment',
      questions: []
    }
  ]

  const handleStartAssessment = (id: string) => {
    setActiveAssessment(id)
    setResponses({})
  }

  const handleResponse = (questionIndex: number, value: number) => {
    setResponses({ ...responses, [questionIndex]: value })
  }

  const handleSubmit = () => {
    // Submit assessment
    setActiveAssessment(null)
    setResponses({})
  }

  if (activeAssessment) {
    const assessment = assessmentTypes.find(a => a.id === activeAssessment)
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{assessment?.name}</h1>
          <p className="text-gray-600 mt-1">{assessment?.description}</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {assessment?.questions.map((question, index) => (
                <div key={index} className="space-y-3">
                  <p className="font-medium text-gray-900">{index + 1}. {question}</p>
                  <div className="flex gap-4">
                    {['Never', 'Sometimes', 'Often', 'Always'].map((option, value) => (
                      <button
                        key={value}
                        onClick={() => handleResponse(index, value)}
                        className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                          responses[index] === value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-blue-300'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex gap-4 pt-4">
                <Button variant="outline" onClick={() => setActiveAssessment(null)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
                  Submit Assessment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Risk Assessments</h1>
        <p className="text-gray-600 mt-1">Evaluate your gambling behavior</p>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">About Risk Assessments</p>
              <p className="text-sm text-blue-700 mt-1">
                Take a confidential assessment to understand your gambling habits and get personalized recommendations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {assessmentTypes.map((assessment) => (
          <Card key={assessment.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{assessment.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{assessment.description}</p>
                  <p className="text-xs text-gray-500 mt-2">Duration: {assessment.duration}</p>
                </div>
                <Button onClick={() => handleStartAssessment(assessment.id)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Start
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {assessments && assessments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Previous Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assessments.map((assessment: any) => (
                <div key={assessment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{assessment.type}</p>
                    <p className="text-sm text-gray-600">Score: {assessment.score}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{new Date(assessment.created_at).toLocaleDateString()}</p>
                    <CheckCircle className="h-5 w-5 text-green-600 ml-auto mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
