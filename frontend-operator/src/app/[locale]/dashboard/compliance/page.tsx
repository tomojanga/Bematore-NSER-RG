'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import apiService from '@/lib/api-service'
import { Shield, CheckCircle, AlertTriangle, Download, TrendingUp, AlertCircle, Loader } from 'lucide-react'

interface ComplianceMetric {
  name: string
  value: number
  target: number
  status: 'good' | 'warning' | 'critical'
  unit: string
}

interface ComplianceReport {
  compliance_score: number
  total_checks: number
  passed_checks: number
  failed_checks: number
  last_check_date: string
  metrics: ComplianceMetric[]
}

export default function CompliancePage() {
  const t = useTranslations()
  const [report, setReport] = useState<ComplianceReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [runningCheck, setRunningCheck] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [periodFilter, setPeriodFilter] = useState('30')

  useEffect(() => {
    fetchComplianceReport()
  }, [periodFilter])

  const fetchComplianceReport = async () => {
    try {
      setLoading(true)
      const operatorRes = await apiService.operator.getMe()
      const operatorId = operatorRes.data?.data?.id

      if (!operatorId) {
        setMessage({ type: 'error', text: 'Could not load operator information' })
        setLoading(false)
        return
      }

      const response = await apiService.compliance.getScore(operatorId)
      const reportData = response.data?.data
      
      if (reportData) {
        setReport({
          compliance_score: reportData.compliance_score || 0,
          total_checks: reportData.total_checks || 0,
          passed_checks: reportData.passed_checks || 0,
          failed_checks: reportData.failed_checks || 0,
          last_check_date: reportData.last_check_date || new Date().toISOString(),
          metrics: reportData.metrics || []
        })
      } else {
        setReport({
          compliance_score: 0,
          total_checks: 0,
          passed_checks: 0,
          failed_checks: 0,
          last_check_date: new Date().toISOString(),
          metrics: []
        })
      }
    } catch (error) {
      console.error('Failed to fetch compliance report:', error)
      setMessage({ type: 'error', text: 'Failed to load compliance data' })
      // Set empty report on error
      setReport({
        compliance_score: 0,
        total_checks: 0,
        passed_checks: 0,
        failed_checks: 0,
        last_check_date: new Date().toISOString(),
        metrics: []
      })
    } finally {
      setLoading(false)
    }
  }

  const runComplianceCheck = async () => {
    setRunningCheck(true)
    try {
      const operatorRes = await apiService.operator.getMe()
      const operatorId = operatorRes?.data?.data?.id

      if (!operatorId) {
        setMessage({ type: 'error', text: 'Could not retrieve operator information' })
        return
      }

      await apiService.compliance.runCheck(operatorId)
      setMessage({ type: 'success', text: 'Compliance check initiated!' })
      // Refresh after delay
      setTimeout(() => fetchComplianceReport(), 2000)
      setTimeout(() => setMessage(null), 5000)
    } catch (error: any) {
      console.error('Compliance check error:', error)
      setMessage({ type: 'error', text: error?.response?.data?.error || error?.response?.data?.message || 'Failed to run compliance check' })
    } finally {
      setRunningCheck(false)
    }
  }

  const downloadReport = async () => {
    try {
      const operatorRes = await apiService.operator.getMe()
      const operatorId = operatorRes?.data?.data?.id

      if (!operatorId) {
        setMessage({ type: 'error', text: 'Could not retrieve operator information' })
        return
      }

      const response = await apiService.compliance.generateReport(operatorId)
      
      if (!response?.data) {
        setMessage({ type: 'error', text: 'No report data received' })
        return
      }
      
      // Download PDF
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `compliance-report-${new Date().toISOString().split('T')[0]}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentElement?.removeChild(link)
      
      setMessage({ type: 'success', text: 'Report downloaded successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      console.error('Download report error:', error)
      setMessage({ type: 'error', text: error?.response?.data?.error || error?.response?.data?.message || 'Failed to download report' })
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200'
    if (score >= 70) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading compliance data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Tracking</h1>
          <p className="text-gray-600 mt-1">Monitor your operational compliance score</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={runComplianceCheck}
            disabled={runningCheck}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition flex items-center gap-2"
          >
            {runningCheck ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Run Check
              </>
            )}
          </button>
          {report && (
            <button
              onClick={downloadReport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className={`rounded-lg p-4 flex gap-3 border ${
          message.type === 'success'
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </p>
        </div>
      )}

      {report && (
        <>
          {/* Compliance Score Card */}
          <div className={`rounded-xl shadow-sm border p-8 flex items-center justify-between ${getScoreBgColor(report.compliance_score)}`}>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Overall Compliance Score</p>
              <p className={`text-5xl font-bold ${getScoreColor(report.compliance_score)}`}>
                {report.compliance_score}%
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Last checked: {new Date(report.last_check_date).toLocaleDateString()}
              </p>
            </div>
            <Shield className={`h-24 w-24 ${getScoreColor(report.compliance_score)}`} />
          </div>

          {/* Check Results Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Checks</p>
                  <p className="text-3xl font-bold text-gray-900">{report.total_checks}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Passed</p>
                  <p className="text-3xl font-bold text-green-600">{report.passed_checks}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Failed</p>
                  <p className="text-3xl font-bold text-red-600">{report.failed_checks}</p>
                </div>
                <div className="p-3 rounded-lg bg-red-50">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Compliance Metrics</h2>
            <div className="space-y-4">
              {report.metrics && Array.isArray(report.metrics) && report.metrics.length > 0 ? (
                report.metrics.map((metric, idx) => (
                <div key={idx} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{metric.name}</h3>
                      <p className="text-sm text-gray-600">Target: {metric.target}{metric.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        metric.status === 'good' ? 'text-green-600' :
                        metric.status === 'warning' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {metric.value}{metric.unit}
                      </p>
                      <p className="text-xs text-gray-500">
                        {metric.status === 'good' ? '✓ Good' :
                         metric.status === 'warning' ? '⚠ Warning' :
                         '✕ Critical'}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        metric.status === 'good' ? 'bg-green-600' :
                        metric.status === 'warning' ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{
                        width: `${Math.min((metric.value / metric.target) * 100, 100)}%`
                      }}
                    />
                  </div>
                  </div>
                  ))
                  ) : (
                  <p className="text-gray-600">No compliance metrics available.</p>
                  )}
                  </div>
                  </div>
                  </>
                  )}

      {/* Compliance Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Compliance Requirements</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li className="flex gap-2">
            <span className="flex-shrink-0">•</span>
            <span>Maintain a compliance score of at least 90% for unrestricted access</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0">•</span>
            <span>API response times must be under 200ms (P99)</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0">•</span>
            <span>Webhook delivery success rate must be at least 99%</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0">•</span>
            <span>Log all API calls and maintain audit trails for 12 months</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0">•</span>
            <span>Complete compliance checks are recommended quarterly</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
