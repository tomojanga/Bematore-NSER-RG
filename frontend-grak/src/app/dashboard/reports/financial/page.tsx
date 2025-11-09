'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import { DollarSign, TrendingUp, CreditCard, Download, Calendar, PieChart } from 'lucide-react'

export default function FinancialReportsPage() {
  const [loading, setLoading] = useState(true)
  const [financialData, setFinancialData] = useState<any>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const operators = await api.operators.statistics()
      setFinancialData({ operators: operators.data.data })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>

  const totalRevenue = 2450000
  const monthlyRevenue = 245000
  const pendingPayments = 125000
  const collectionRate = 95.5

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600 mt-1">Revenue, settlements, and payment tracking</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Report
        </button>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Revenue</p>
              <p className="text-3xl font-bold mt-1">KES {(totalRevenue / 1000000).toFixed(1)}M</p>
              <p className="text-xs opacity-75 mt-2">Year to date</p>
            </div>
            <DollarSign className="h-12 w-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Monthly Revenue</p>
              <p className="text-3xl font-bold mt-1">KES {(monthlyRevenue / 1000).toFixed(0)}K</p>
              <p className="text-xs opacity-75 mt-2">+12% from last month</p>
            </div>
            <TrendingUp className="h-12 w-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Pending Payments</p>
              <p className="text-3xl font-bold mt-1">KES {(pendingPayments / 1000).toFixed(0)}K</p>
              <p className="text-xs opacity-75 mt-2">Awaiting settlement</p>
            </div>
            <CreditCard className="h-12 w-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Collection Rate</p>
              <p className="text-3xl font-bold mt-1">{collectionRate}%</p>
              <p className="text-xs opacity-75 mt-2">Excellent performance</p>
            </div>
            <PieChart className="h-12 w-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue by Source</h2>
          <div className="space-y-4">
            {[
              { source: 'License Fees', amount: 1500000, percentage: 61 },
              { source: 'API Service Charges', amount: 650000, percentage: 27 },
              { source: 'Compliance Fees', amount: 200000, percentage: 8 },
              { source: 'Other Services', amount: 100000, percentage: 4 }
            ].map((item) => (
              <div key={item.source}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.source}</span>
                  <span className="text-sm text-gray-600">
                    KES {(item.amount / 1000).toFixed(0)}K ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Trend</h2>
          <div className="space-y-3">
            {[
              { month: 'January', revenue: 220000, growth: 8 },
              { month: 'February', revenue: 235000, growth: 6.8 },
              { month: 'March', revenue: 245000, growth: 4.3 },
              { month: 'April', revenue: 240000, growth: -2.0 }
            ].map((item) => (
              <div key={item.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-gray-900">{item.month}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    KES {(item.revenue / 1000).toFixed(0)}K
                  </div>
                  <div className={`text-xs ${item.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.growth >= 0 ? '+' : ''}{item.growth}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operator Payment Status */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Operator Payment Status</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operator</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License Fee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Charges</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Due</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { name: 'BetKing Kenya', license: 50000, service: 12000, status: 'paid', date: '2025-01-15' },
                { name: 'SportPesa', license: 50000, service: 15000, status: 'paid', date: '2025-01-15' },
                { name: 'Betway Kenya', license: 50000, service: 11000, status: 'pending', date: '2025-01-20' },
                { name: 'Mozzart Bet', license: 50000, service: 9000, status: 'pending', date: '2025-01-20' },
                { name: '22Bet Kenya', license: 50000, service: 8000, status: 'overdue', date: '2025-01-10' }
              ].map((operator, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{operator.name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    KES {operator.license.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    KES {operator.service.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    KES {(operator.license + operator.service).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      operator.status === 'paid' ? 'bg-green-100 text-green-800' :
                      operator.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {operator.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(operator.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* M-Pesa Settlement Summary */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">M-Pesa Settlement Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">1,245</p>
            <p className="text-sm text-gray-600 mt-2">Total Transactions</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">KES 2.1M</p>
            <p className="text-sm text-gray-600 mt-2">Total Amount</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">99.2%</p>
            <p className="text-sm text-gray-600 mt-2">Success Rate</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-3xl font-bold text-yellow-600">15 min</p>
            <p className="text-sm text-gray-600 mt-2">Avg Settlement Time</p>
          </div>
        </div>
      </div>

      {/* Financial Health Indicators */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Financial Health Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Revenue Growth</span>
              <span className="text-sm font-semibold text-green-600">+12%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Payment Compliance</span>
              <span className="text-sm font-semibold text-green-600">95.5%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '95.5%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Outstanding Ratio</span>
              <span className="text-sm font-semibold text-yellow-600">5.1%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '5.1%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
