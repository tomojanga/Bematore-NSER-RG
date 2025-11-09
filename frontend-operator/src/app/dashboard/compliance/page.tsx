'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Shield, CheckCircle, AlertTriangle, Download, Calendar } from 'lucide-react'

export default function CompliancePage() {
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const generateReport = async () => {
    if (!startDate || !endDate) return
    
    setLoading(true)
    try {
      const response = await api.post('/nser/reports/compliance/', {
        start_date: startDate,
        end_date: endDate
      })
      setReport(response.data.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Compliance Report</h1>
        <p className="text-gray-600 mt-1">Monitor your exclusion compliance metrics</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={loading || !startDate || !endDate}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Exclusions</p>
                  <p className="text-2xl font-bold text-gray-900">{report.total_exclusions || 0}</p>
                </div>
                <Shield className="h-8 w-8 text-indigo-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Exclusions</p>
                  <p className="text-2xl font-bold text-gray-900">{report.active_exclusions || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Compliance Score</p>
                  <p className="text-2xl font-bold text-gray-900">{report.compliance_score || 0}%</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Report Details</h2>
              <button className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700">
                <Download className="h-4 w-4" />
                Export PDF
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Report Period</span>
                <span className="font-medium">{report.period}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Propagation Rate</span>
                <span className="font-medium">{report.propagation_rate || 0}%</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Compliance Score</span>
                <span className="font-medium text-green-600">{report.compliance_score || 0}%</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
