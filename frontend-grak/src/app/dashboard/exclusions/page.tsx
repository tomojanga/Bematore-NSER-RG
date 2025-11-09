'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Shield, Eye, XCircle } from 'lucide-react'

export default function ExclusionsPage() {
  const [exclusions, setExclusions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExclusions()
  }, [])

  const fetchExclusions = async () => {
    try {
      const response = await api.get('/nser/exclusions/')
      setExclusions(response.data.data?.results || response.data.results || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleTerminate = async (id: string) => {
    const reason = prompt('Enter termination reason:')
    if (!reason) return

    try {
      await api.post(`/nser/exclusions/${id}/terminate/`, { termination_reason: reason })
      alert('Exclusion terminated successfully')
      fetchExclusions()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to terminate exclusion')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Self-Exclusions</h1>
        <p className="text-gray-600 mt-1">Manage self-exclusion records</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {exclusions.map((exclusion) => (
              <tr key={exclusion.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-gray-900">{exclusion.reference_number}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {exclusion.is_permanent ? 'Permanent' : exclusion.exclusion_period?.replace('_', ' ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(exclusion.start_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {exclusion.end_date ? new Date(exclusion.end_date).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    exclusion.status === 'active' ? 'bg-red-100 text-red-800' :
                    exclusion.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {exclusion.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-900" title="View Details">
                      <Eye className="h-5 w-5" />
                    </button>
                    {exclusion.status === 'active' && (
                      <button
                        onClick={() => handleTerminate(exclusion.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Terminate"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    )}
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
