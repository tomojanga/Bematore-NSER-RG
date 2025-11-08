'use client'

import { useState } from 'react'
import { useExclusions } from '@/hooks/useExclusions'
import { Card, CardContent, CardHeader, CardTitle, StatusBadge } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Table } from '@/components/ui/Table'
import { Shield, Search, Filter, Download, Eye, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { formatDate, formatPhoneNumber } from '@/lib/utils'

export default function ExclusionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { data, isLoading, refetch } = useExclusions({ 
    search: searchTerm,
    status: statusFilter !== 'all' ? statusFilter : undefined 
  })

  const exclusions = data?.results || []

  const columns = [
    { key: 'reference_number', label: 'Reference' },
    { key: 'user', label: 'User', render: (row: any) => (
      <div>
        <p className="font-medium">{row.user?.full_name || 'N/A'}</p>
        <p className="text-xs text-gray-500">{formatPhoneNumber(row.user?.phone_number || '')}</p>
      </div>
    )},
    { key: 'exclusion_period', label: 'Period', render: (row: any) => (
      <span className="capitalize">{row.exclusion_period?.replace('_', ' ')}</span>
    )},
    { key: 'start_date', label: 'Start Date', render: (row: any) => formatDate(row.start_date) },
    { key: 'end_date', label: 'End Date', render: (row: any) => formatDate(row.end_date) },
    { key: 'status', label: 'Status', render: (row: any) => <StatusBadge status={row.status} /> },
    { key: 'is_active', label: 'Active', render: (row: any) => (
      row.is_active ? 
        <CheckCircle className="h-5 w-5 text-green-600" /> : 
        <XCircle className="h-5 w-5 text-gray-400" />
    )},
    { key: 'actions', label: 'Actions', render: (row: any) => (
      <Button size="sm" variant="outline">
        <Eye className="h-4 w-4 mr-1" />
        View
      </Button>
    )}
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Self-Exclusions</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all self-exclusion registrations</p>
        </div>
        <Button>
          <Shield className="h-4 w-4 mr-2" />
          New Exclusion
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Exclusions</p>
                <p className="text-2xl font-bold mt-1">{data?.count || 0}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold mt-1 text-green-600">
                  {exclusions.filter((e: any) => e.is_active).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold mt-1 text-yellow-600">
                  {exclusions.filter((e: any) => e.status === 'pending').length}
                </p>
              </div>
              <RefreshCw className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-2xl font-bold mt-1 text-gray-600">
                  {exclusions.filter((e: any) => e.status === 'expired').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exclusion Records</CardTitle>
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, phone, or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="terminated">Terminated</option>
            </select>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table
            columns={columns}
            data={exclusions}
            isLoading={isLoading}
            emptyMessage="No exclusions found"
          />
        </CardContent>
      </Card>
    </div>
  )
}
