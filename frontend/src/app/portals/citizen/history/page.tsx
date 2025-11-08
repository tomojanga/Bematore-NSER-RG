'use client'

import { useMyExclusions } from '@/hooks/useExclusions'
import { Card, CardContent, CardHeader, CardTitle, StatusBadge } from '@/components/ui/Card'
import { History } from 'lucide-react'

export default function CitizenHistoryPage() {
  const { data, isLoading } = useMyExclusions()

  const exclusions = data?.results || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My History</h1>
        <p className="text-gray-600 mt-1">View your self-exclusion history</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exclusion History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : exclusions.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">No exclusion history</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exclusions.map((exclusion: any) => (
                <div key={exclusion.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <StatusBadge status={exclusion.status} />
                    <span className="text-sm text-gray-500">
                      {exclusion.period_months} months
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Start Date</p>
                      <p className="font-medium">{new Date(exclusion.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">End Date</p>
                      <p className="font-medium">{new Date(exclusion.end_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {exclusion.reason && (
                    <p className="text-sm text-gray-600 mt-2">Reason: {exclusion.reason}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
