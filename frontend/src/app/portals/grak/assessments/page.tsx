'use client'

import { useState } from 'react'
import { useAssessments } from '@/hooks/useAssessments'
import { Card, CardContent, CardHeader, CardTitle, RiskBadge } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FileText, Search, Eye } from 'lucide-react'

export default function GRAKAssessmentsPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useAssessments({ search })

  const assessments = data?.data?.items || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Risk Assessments</h1>
          <p className="text-gray-600 mt-1">Review player risk assessments and behavioral analysis</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Assessments</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search assessments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operator</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {assessments.map((assessment: any) => (
                    <tr key={assessment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {assessment.user?.full_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <RiskBadge level={assessment.risk_level} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{assessment.risk_score}/100</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{assessment.operator?.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(assessment.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
