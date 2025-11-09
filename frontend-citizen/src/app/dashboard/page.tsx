'use client'

import { useMyExclusions, useExclusionStatus } from '@/hooks/useExclusions'
import { Card, CardContent, CardHeader, CardTitle, StatusBadge } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Shield, AlertCircle, CheckCircle, Calendar, FileText, Clock, Loader2, TrendingUp, Activity } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: exclusions, isLoading: isLoadingExclusions } = useMyExclusions()
  const { data: status, isLoading: isLoadingStatus } = useExclusionStatus()

  const activeExclusion = exclusions?.results?.find((e: any) => e.status === 'active')
  const daysRemaining = activeExclusion ? Math.ceil((new Date(activeExclusion.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0

  if (isLoadingExclusions || isLoadingStatus) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back{user?.first_name ? `, ${user.first_name}` : ''}!
        </h1>
        <p className="text-gray-600 mt-1">Here's your self-exclusion overview</p>
      </div>

      {activeExclusion ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900">You are currently self-excluded</h3>
                <p className="text-sm text-red-700 mt-1">
                  Your self-exclusion is active and will expire on{' '}
                  {new Date(activeExclusion.end_date).toLocaleDateString()}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-red-600">Start Date</p>
                    <p className="text-sm font-medium text-red-900">
                      {new Date(activeExclusion.start_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-red-600">End Date</p>
                    <p className="text-sm font-medium text-red-900">
                      {new Date(activeExclusion.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-red-600">Days Remaining</p>
                    <p className="text-sm font-medium text-red-900">{daysRemaining} days</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-red-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, ((activeExclusion.period_months * 30 - daysRemaining) / (activeExclusion.period_months * 30)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900">No active self-exclusion</h3>
                <p className="text-sm text-green-700 mt-1">
                  You can participate in gambling activities. Consider self-excluding if you need help.
                </p>
                <Link href="/dashboard/self-exclude">
                  <Button className="mt-4">Self-Exclude Now</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-gray-600">
              <Shield className="h-4 w-4" />
              Total Exclusions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{exclusions?.count || 0}</p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-gray-600">
              <Activity className="h-4 w-4" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status?.data?.is_excluded ? (
              <div>
                <p className="text-3xl font-bold text-red-600">Excluded</p>
                <p className="text-xs text-gray-500 mt-1">Protected</p>
              </div>
            ) : (
              <div>
                <p className="text-3xl font-bold text-green-600">Active</p>
                <p className="text-xs text-gray-500 mt-1">No restrictions</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-gray-600">
              <FileText className="h-4 w-4" />
              Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-xs text-gray-500 mt-1">Completed</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              Account Age
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              {Math.floor((Date.now() - new Date(user?.created_at || '').getTime()) / (1000 * 60 * 60 * 24))}
            </p>
            <p className="text-xs text-gray-500 mt-1">Days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/dashboard/self-exclude" className="block">
              <button className="w-full flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all">
                <Shield className="h-8 w-8 text-red-400" />
                <span className="text-sm font-medium text-gray-700">Self-Exclude</span>
              </button>
            </Link>
            <Link href="/dashboard/assessments" className="block">
              <button className="w-full flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all">
                <FileText className="h-8 w-8 text-blue-400" />
                <span className="text-sm font-medium text-gray-700">Take Assessment</span>
              </button>
            </Link>
            <Link href="/dashboard/history" className="block">
              <button className="w-full flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all">
                <Clock className="h-8 w-8 text-purple-400" />
                <span className="text-sm font-medium text-gray-700">View History</span>
              </button>
            </Link>
            <Link href="/dashboard/settings" className="block">
              <button className="w-full flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all">
                <Activity className="h-8 w-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Settings</span>
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {exclusions?.results && exclusions.results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exclusions.results.slice(0, 3).map((exclusion: any) => (
                <div key={exclusion.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Self-Exclusion</p>
                      <p className="text-sm text-gray-600">{exclusion.period_months} months</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={exclusion.status} />
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(exclusion.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
