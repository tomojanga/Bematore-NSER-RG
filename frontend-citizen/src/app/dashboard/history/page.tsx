'use client'

import { useMyExclusions } from '@/hooks/useExclusions'
import { Card, CardContent, CardHeader, CardTitle, StatusBadge } from '@/components/ui/Card'
import { Shield, Calendar, Clock, Loader2, AlertCircle } from 'lucide-react'

export default function HistoryPage() {
  const { data: exclusions, isLoading } = useMyExclusions()
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Exclusion History</h1>
        <p className="text-gray-600 mt-1">View your past and current self-exclusions</p>
      </div>

      {exclusions?.results && exclusions.results.length > 0 ? (
        <div className="space-y-4">
          {exclusions.results.map((exclusion: any) => (
            <Card key={exclusion.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          Self-Exclusion
                        </h3>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {exclusion.exclusion_period?.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{exclusion.reason}</p>
                      <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <div>
                            <p className="text-xs text-gray-400">Started</p>
                            <p className="font-medium">{new Date(exclusion.start_date || exclusion.created_at).toLocaleDateString('en-GB')}</p>
                          </div>
                        </div>
                        {exclusion.end_date && (
                          <div className="flex items-center gap-1 text-gray-500">
                            <Clock className="h-4 w-4" />
                            <div>
                              <p className="text-xs text-gray-400">Ends</p>
                              <p className="font-medium">{new Date(exclusion.end_date).toLocaleDateString('en-GB')}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      {exclusion.status === 'active' && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded">
                          <AlertCircle className="h-3 w-3" />
                          <span>Currently active - {Math.ceil((new Date(exclusion.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={exclusion.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No exclusion history found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
