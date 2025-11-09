'use client'

import { useState } from 'react'
import { useUsers } from '@/hooks/useUsers'
import { Card, CardContent, CardHeader, CardTitle, StatusBadge, RiskBadge } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Table } from '@/components/ui/Table'
import { Users, Search, Filter, Download, Eye, Shield, AlertCircle, CheckCircle } from 'lucide-react'
import { formatDate, formatPhoneNumber, formatRole } from '@/lib/utils'
import { Badge } from '@/components/ui/Card'

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const { data, isLoading } = useUsers({ 
    search: searchTerm,
    role: roleFilter !== 'all' ? roleFilter : undefined 
  })

  const users = data?.results || []

  const columns = [
    { key: 'user', label: 'User', render: (row: any) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
          {row.first_name?.charAt(0)}{row.last_name?.charAt(0)}
        </div>
        <div>
          <p className="font-medium">{row.first_name} {row.last_name}</p>
          <p className="text-xs text-gray-500">{formatPhoneNumber(row.phone_number)}</p>
        </div>
      </div>
    )},
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (row: any) => (
      <Badge variant="info">{formatRole(row.role)}</Badge>
    )},
    { key: 'verification_status', label: 'Verification', render: (row: any) => (
      <div className="flex gap-1">
        {row.phone_verified && <Badge variant="success" size="sm">Phone</Badge>}
        {row.email_verified && <Badge variant="success" size="sm">Email</Badge>}
        {row.id_verified && <Badge variant="success" size="sm">ID</Badge>}
      </div>
    )},
    { key: 'is_excluded', label: 'Excluded', render: (row: any) => (
      row.is_excluded ? 
        <Shield className="h-5 w-5 text-red-600" /> : 
        <span className="text-gray-400">-</span>
    )},
    { key: 'risk_level', label: 'Risk', render: (row: any) => (
      row.risk_level ? <RiskBadge riskLevel={row.risk_level} /> : <span className="text-gray-400">-</span>
    )},
    { key: 'date_joined', label: 'Joined', render: (row: any) => formatDate(row.date_joined) },
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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage all registered users and their profiles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold mt-1">{data?.count || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold mt-1 text-green-600">
                  {users.filter((u: any) => u.phone_verified && u.email_verified).length}
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
                <p className="text-sm text-gray-600">Excluded</p>
                <p className="text-2xl font-bold mt-1 text-red-600">
                  {users.filter((u: any) => u.is_excluded).length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Risk</p>
                <p className="text-2xl font-bold mt-1 text-yellow-600">
                  {users.filter((u: any) => u.risk_level === 'high').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="citizen">Citizen</option>
              <option value="operator_user">Operator User</option>
              <option value="operator_admin">Operator Admin</option>
              <option value="grak_officer">GRAK Officer</option>
              <option value="grak_admin">GRAK Admin</option>
            </select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table
            columns={columns}
            data={users}
            isLoading={isLoading}
            emptyMessage="No users found"
          />
        </CardContent>
      </Card>
    </div>
  )
}
