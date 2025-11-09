'use client'

import { useCompliance } from '@/hooks/useCompliance'
import { Card, CardContent, CardHeader, CardTitle, StatusBadge } from '@/components/ui/Card'
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react'

export default function GRAKCompliancePage() {
  const { data, isLoading } = useCompliance()

  const reports = data?.data?.items || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Compliance Monitoring</h1>
        <p className="text-gray-600 mt-1">Track operator compliance and regulatory adherence</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{data?.compliant_count || 0}</p>
                <p className="text-sm text-gray-600">Compliant Operators</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{data?.warning_count || 0}</p>
                <p className="text-sm text-gray-600">Warnings Issued</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{data?.violation_count || 0}</p>
                <p className="text-sm text-gray-600">Active Violations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operator</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Check</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issues</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reports.map((report: any) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{report.operator?.name}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={report.is_compliant ? 'compliant' : 'non_compliant'} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{report.compliance_score}%</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(report.last_check).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{report.issues_count || 0}</td>
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
