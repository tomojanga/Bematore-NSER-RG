'use client'

import { useState } from 'react'
import { useOperators } from '@/hooks/useOperators'
import { Card, CardContent, CardHeader, CardTitle, StatusBadge, Badge } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Table } from '@/components/ui/Table'
import { Building2, Search, Plus, Eye, Settings, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function OperatorsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data, isLoading } = useOperators({ search: searchTerm })

  const operators = data?.results || []

  const columns = [
    { key: 'name', label: 'Operator Name', render: (row: any) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
          {row.name?.charAt(0)}
        </div>
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-gray-500">{row.license_number}</p>
        </div>
      </div>
    )},
    { key: 'contact_email', label: 'Contact' },
    { key: 'status', label: 'Status', render: (row: any) => <StatusBadge status={row.status} /> },
    { key: 'compliance_score', label: 'Compliance', render: (row: any) => (
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
          <div 
            className={`h-2 rounded-full ${
              row.compliance_score >= 80 ? 'bg-green-600' : 
              row.compliance_score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
            }`}
            style={{ width: `${row.compliance_score || 0}%` }}
          />
        </div>
        <span className="text-sm font-medium">{row.compliance_score || 0}%</span>
      </div>
    )},
    { key: 'api_integration_status', label: 'Integration', render: (row: any) => (
      row.api_integration_status === 'active' ? 
        <CheckCircle className="h-5 w-5 text-green-600" /> : 
        <XCircle className="h-5 w-5 text-gray-400" />
    )},
    { key: 'license_expiry', label: 'License Expiry', render: (row: any) => formatDate(row.license_expiry) },
    { key: 'actions', label: 'Actions', render: (row: any) => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline">
          <Eye className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    )}
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Licensed Operators</h1>
          <p className="text-gray-600 mt-1">Manage gambling operators and their compliance</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Register Operator
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Operators</p>
                <p className="text-2xl font-bold mt-1">{data?.count || 0}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold mt-1 text-green-600">
                  {operators.filter((o: any) => o.status === 'active').length}
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
                <p className="text-sm text-gray-600">Suspended</p>
                <p className="text-2xl font-bold mt-1 text-red-600">
                  {operators.filter((o: any) => o.status === 'suspended').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Compliance Issues</p>
                <p className="text-2xl font-bold mt-1 text-yellow-600">
                  {operators.filter((o: any) => (o.compliance_score || 0) < 80).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Operator Directory</CardTitle>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search operators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table
            columns={columns}
            data={operators}
            isLoading={isLoading}
            emptyMessage="No operators found"
          />
        </CardContent>
      </Card>
    </div>
  )
}
