'use client'

import { useState } from 'react'
import { useExclusions } from '@/hooks/useExclusions'
import { Card, CardContent, CardHeader, CardTitle, StatusBadge } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Shield, Search, Download, Eye } from 'lucide-react'

export default function GRAKExclusionsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('all')
  const { data, isLoading } = useExclusions({ search, status: status !== 'all' ? status : undefined })

  const exclusions = data?.data?.items || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Self-Exclusion Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all self-exclusion registrations</p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Exclusions</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by phone, ID, name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="pending">Pending</option>
              </select>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {exclusions.map((exclusion: any) => (
                    <tr key={exclusion.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {exclusion.user?.full_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{exclusion.user?.phone_number}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{exclusion.period_months} months</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={exclusion.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(exclusion.start_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(exclusion.end_date).toLocaleDateString()}
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
