'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react'

export default function OperatorsPage() {
  const [operators, setOperators] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchOperators()
  }, [filter])

  const fetchOperators = async () => {
    try {
      const response = await api.get('/operators/', {
        params: filter !== 'all' ? { license_status: filter } : {}
      })
      setOperators(response.data.data?.results || response.data.results || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this operator?')) return
    
    try {
      await api.post(`/operators/${id}/activate/`)
      alert('Operator approved successfully')
      fetchOperators()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to approve operator')
    }
  }

  const handleSuspend = async (id: string) => {
    if (!confirm('Suspend this operator?')) return
    
    try {
      await api.post(`/operators/${id}/suspend/`)
      alert('Operator suspended successfully')
      fetchOperators()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to suspend operator')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operators</h1>
          <p className="text-gray-600 mt-1">Manage gambling operators</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg ${filter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Active
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operator</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {operators.map((operator) => (
              <tr key={operator.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{operator.name}</div>
                  <div className="text-sm text-gray-500">{operator.operator_code}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {operator.license_number || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    operator.license_status === 'active' ? 'bg-green-100 text-green-800' :
                    operator.license_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {operator.license_status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>{operator.email}</div>
                  <div className="text-gray-500">{operator.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    {operator.license_status === 'pending' && (
                      <button
                        onClick={() => handleApprove(operator.id)}
                        className="text-green-600 hover:text-green-900"
                        title="Approve"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    )}
                    {operator.license_status === 'active' && (
                      <button
                        onClick={() => handleSuspend(operator.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Suspend"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    )}
                    <button className="text-blue-600 hover:text-blue-900" title="View Details">
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
