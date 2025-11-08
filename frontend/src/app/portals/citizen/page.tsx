'use client'

import { useMyExclusions, useExclusionStatus } from '@/hooks/useExclusions'
import { Card, CardContent, CardHeader, CardTitle, StatusBadge } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Shield, AlertCircle, CheckCircle, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function CitizenDashboardPage() {
  const { data: exclusions } = useMyExclusions()
  const { data: status } = useExclusionStatus()

  const activeExclusion = exclusions?.results?.find((e: any) => e.status === 'active')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your self-exclusion and gambling activity</p>
      </div>

      {activeExclusion ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900">You are currently self-excluded</h3>
                <p className="text-sm text-red-700 mt-1">
                  Your self-exclusion is active and will expire on{' '}
                  {new Date(activeExclusion.end_date).toLocaleDateString()}
                </p>
                <div className="mt-4 flex items-center gap-4">
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
                    <p className="text-xs text-red-600">Period</p>
                    <p className="text-sm font-medium text-red-900">{activeExclusion.period_months} months</p>
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
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900">No active self-exclusion</h3>
                <p className="text-sm text-green-700 mt-1">
                  You can participate in gambling activities. Consider self-excluding if you need help.
                </p>
                <Link href="/portals/citizen/self-exclude">
                  <Button className="mt-4">Self-Exclude Now</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Exclusions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{exclusions?.count || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={status?.data?.is_excluded ? 'excluded' : 'active'} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Last Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">No assessments yet</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/portals/citizen/self-exclude">
              <button className="w-full flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all">
                <Shield className="h-8 w-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Self-Exclude</span>
              </button>
            </Link>
            <Link href="/portals/citizen/assessments">
              <button className="w-full flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all">
                <Calendar className="h-8 w-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Take Assessment</span>
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
