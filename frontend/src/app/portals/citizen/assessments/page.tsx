'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FileText, AlertCircle } from 'lucide-react'

export default function CitizenAssessmentsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Risk Assessment</h1>
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

      <Card>
        <CardHeader>
          <CardTitle>Available Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'PGSI Assessment', duration: '5 minutes', description: 'Problem Gambling Severity Index' },
              { name: 'Lie/Bet Questionnaire', duration: '2 minutes', description: 'Quick screening tool' },
              { name: 'DSM-5 Criteria', duration: '10 minutes', description: 'Comprehensive diagnostic assessment' }
            ].map((assessment) => (
              <div key={assessment.name} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{assessment.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{assessment.description}</p>
                    <p className="text-xs text-gray-500 mt-2">Duration: {assessment.duration}</p>
                  </div>
                  <Button size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Start
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
