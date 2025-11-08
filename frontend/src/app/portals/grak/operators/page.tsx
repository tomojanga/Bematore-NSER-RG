'use client'

import { useState } from 'react'
import { useOperators } from '@/hooks/useOperators'
import { Card, CardContent, CardHeader, CardTitle, StatusBadge } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Building2, Search, Eye, CheckCircle, AlertCircle } from 'lucide-react'

export default function GRAKOperatorsPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useOperators({ search })

  const operators = data?.data?.items || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Licensed Operators</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all gambling operators</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Operators</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search operators..."
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operator</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compliance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">API Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {operators.map((operator: any) => (
                    <tr key={operator.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{operator.name}</p>
                            <p className="text-xs text-gray-500">{operator.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{operator.license_number}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={operator.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {operator.is_compliant ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-sm">{operator.compliance_score}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${operator.api_enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-sm text-gray-600">{operator.api_enabled ? 'Active' : 'Inactive'}</span>
                        </div>
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
