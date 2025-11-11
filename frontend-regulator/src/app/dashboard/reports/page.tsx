'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import { FileText, Download, Calendar, Filter, RefreshCw } from 'lucide-react'

export default function ReportsPage() {
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<any>({})
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reportType, setReportType] = useState('operators')

  useEffect(() => {
    fetchReportData()
  }, [reportType, startDate, endDate])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      const [operators, nser, screening] = await Promise.all([
        api.operators.statistics(),
        api.nser.statistics(),
        api.screening.statistics()
      ])
      
      setReportData({
        operators: operators.data.data || operators.data,
        nser: nser.data.data || nser.data,
        screening: screening.data.data || screening.data
      })
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (type: string, format: 'csv' | 'pdf' | 'excel') => {
    setLoading(true)
    try {
      const params: any = { report_type: type }
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate

      if (format === 'csv') {
        const response = await api.post('/analytics/export/csv/', params, {
          responseType: 'blob'
        })
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        link.remove()
      } else if (format === 'pdf') {
        const response = await api.post('/analytics/export/pdf/', params, {
          responseType: 'blob'
        })
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
      } else if (format === 'excel') {
        const response = await api.post('/analytics/export/excel/', params, {
          responseType: 'blob'
        })
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.xlsx`)
        document.body.appendChild(link)
        link.click()
        link.remove()
      }
    } catch (error: any) {
      console.error('Export error:', error)
      alert(error.response?.data?.message || 'Export failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !reportData.operators) {
    return <div className="flex items-center justify-center h-64">Loading reports...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Generate and export regulatory compliance reports</p>
        </div>
        <button
          onClick={fetchReportData}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Report Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="operators">Operator Performance</option>
              <option value="exclusions">NSER Exclusions</option>
              <option value="screening">Risk Assessments</option>
              <option value="compliance">Compliance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <p className="text-sm opacity-90">Total Operators</p>
          <p className="text-3xl font-bold mt-1">{reportData.operators?.total_operators || 0}</p>
          <p className="text-xs opacity-75 mt-2">Active: {reportData.operators?.active_operators || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-lg shadow-lg">
          <p className="text-sm opacity-90">Active Exclusions</p>
          <p className="text-3xl font-bold mt-1">{reportData.nser?.total_active_exclusions || 0}</p>
          <p className="text-xs opacity-75 mt-2">Total: {reportData.nser?.total_exclusions || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <p className="text-sm opacity-90">Screening Sessions</p>
          <p className="text-3xl font-bold mt-1">{reportData.screening?.total_sessions || 0}</p>
          <p className="text-xs opacity-75 mt-2">Completed: {reportData.screening?.completed_sessions || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow-lg">
          <p className="text-sm opacity-90">High Risk Users</p>
          <p className="text-3xl font-bold mt-1">{reportData.screening?.high_risk_count || 0}</p>
          <p className="text-xs opacity-75 mt-2">Requires attention</p>
        </div>
      </div>

      {/* Export Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Export Current Report</h2>
        <div className="flex gap-3">
          <button
            onClick={() => exportReport(reportType, 'csv')}
            disabled={loading}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Download className="h-5 w-5" />
            Export CSV
          </button>
          <button
            onClick={() => exportReport(reportType, 'pdf')}
            disabled={loading}
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            <Download className="h-5 w-5" />
            Export PDF
          </button>
          <button
            onClick={() => exportReport(reportType, 'excel')}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Download className="h-5 w-5" />
            Export Excel
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          {startDate && endDate 
            ? `Exporting data from ${startDate} to ${endDate}` 
            : 'Exporting all available data'}
        </p>
      </div>

      {/* Available Reports */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Available Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReportCard
            title="Operator Performance Report"
            description="Compliance scores, API usage, license status"
            type="operators"
            onExport={exportReport}
            loading={loading}
          />
          <ReportCard
            title="NSER Exclusion Statistics"
            description="Self-exclusion trends, demographics, duration analysis"
            type="exclusions"
            onExport={exportReport}
            loading={loading}
          />
          <ReportCard
            title="Risk Assessment Report"
            description="Screening sessions, risk distribution, high-risk users"
            type="screening"
            onExport={exportReport}
            loading={loading}
          />
          <ReportCard
            title="Regulatory Compliance Report"
            description="DPA 2019 compliance, GRAK regulations, audit trail"
            type="compliance"
            onExport={exportReport}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}

function ReportCard({ title, description, type, onExport, loading }: any) {
  const [showFormats, setShowFormats] = useState(false)

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <FileText className="h-6 w-6 text-blue-600 mt-1" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          <div className="mt-3">
            <button
              onClick={() => setShowFormats(!showFormats)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {showFormats ? 'Hide formats' : 'Export options →'}
            </button>
            {showFormats && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => { onExport(type, 'csv'); setShowFormats(false); }}
                  disabled={loading}
                  className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  CSV
                </button>
                <button
                  onClick={() => { onExport(type, 'pdf'); setShowFormats(false); }}
                  disabled={loading}
                  className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  PDF
                </button>
                <button
                  onClick={() => { onExport(type, 'excel'); setShowFormats(false); }}
                  disabled={loading}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
