'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, StatusBadge, RiskBadge } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Search, Shield, AlertTriangle, CheckCircle, XCircle, User, Phone, Hash } from 'lucide-react'
import { api } from '@/lib/api-client'
import { useToast } from '@/components/ui/use-toast'
import { formatDate, formatPhoneNumber } from '@/lib/utils'

export default function LookupPage() {
  const { toast } = useToast()
  const [lookupType, setLookupType] = useState<'phone' | 'id' | 'bst'>('phone')
  const [lookupValue, setLookupValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleLookup = async () => {
    if (!lookupValue.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a value to lookup',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      let response
      
      if (lookupType === 'bst') {
        response = await api.nser.bstLookup(lookupValue)
      } else {
        response = await api.nser.lookup({
          [lookupType === 'phone' ? 'phone_number' : 'national_id']: lookupValue
        })
      }

      setResult(response.data)
      
      if (response.data.is_excluded) {
        toast({
          title: 'User is Excluded',
          description: 'This user has an active self-exclusion',
          variant: 'destructive'
        })
      } else {
        toast({
          title: 'Lookup Successful',
          description: 'User is not excluded',
          variant: 'default'
        })
      }
    } catch (error: any) {
      toast({
        title: 'Lookup Failed',
        description: error.response?.data?.message || 'Failed to perform lookup',
        variant: 'destructive'
      })
      setResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Lookup</h1>
        <p className="text-gray-600 mt-1">Check exclusion status before allowing gambling activities</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lookup User</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lookup Method
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setLookupType('phone')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                    lookupType === 'phone'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Phone className="h-5 w-5 mx-auto mb-1" />
                  <p className="text-sm font-medium">Phone Number</p>
                </button>
                <button
                  onClick={() => setLookupType('id')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                    lookupType === 'id'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <User className="h-5 w-5 mx-auto mb-1" />
                  <p className="text-sm font-medium">National ID</p>
                </button>
                <button
                  onClick={() => setLookupType('bst')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                    lookupType === 'bst'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Hash className="h-5 w-5 mx-auto mb-1" />
                  <p className="text-sm font-medium">BST Token</p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {lookupType === 'phone' ? 'Phone Number' : 
                 lookupType === 'id' ? 'National ID' : 'BST Token'}
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder={
                      lookupType === 'phone' ? '254712345678' :
                      lookupType === 'id' ? '12345678' :
                      'BST token...'
                    }
                    value={lookupValue}
                    onChange={(e) => setLookupValue(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleLookup()}
                  />
                </div>
                <Button onClick={handleLookup} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Lookup
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Lookup Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Exclusion Status Alert */}
              <div className={`p-4 rounded-lg border-2 ${
                result.is_excluded
                  ? 'bg-red-50 border-red-200'
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center gap-3">
                  {result.is_excluded ? (
                    <>
                      <XCircle className="h-8 w-8 text-red-600" />
                      <div>
                        <p className="font-bold text-red-900">USER IS EXCLUDED</p>
                        <p className="text-sm text-red-700">Do not allow gambling activities</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-bold text-green-900">USER IS NOT EXCLUDED</p>
                        <p className="text-sm text-green-700">User can participate in gambling activities</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* User Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium">{result.user?.full_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="font-medium">{formatPhoneNumber(result.user?.phone_number || '')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">National ID</p>
                  <p className="font-medium">{result.user?.national_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Risk Level</p>
                  {result.risk_level ? (
                    <RiskBadge riskLevel={result.risk_level} />
                  ) : (
                    <p className="text-gray-400">Not assessed</p>
                  )}
                </div>
              </div>

              {/* Exclusion Details */}
              {result.is_excluded && result.exclusion && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Exclusion Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Reference Number</p>
                      <p className="font-medium">{result.exclusion.reference_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Period</p>
                      <p className="font-medium capitalize">
                        {result.exclusion.exclusion_period?.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="font-medium">{formatDate(result.exclusion.start_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">End Date</p>
                      <p className="font-medium">{formatDate(result.exclusion.end_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <StatusBadge status={result.exclusion.status} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Days Remaining</p>
                      <p className="font-medium">{result.exclusion.days_remaining || 0} days</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Lookup Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-medium">Select Lookup Method</p>
                <p className="text-sm text-gray-600">Choose phone number, national ID, or BST token</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-medium">Enter User Information</p>
                <p className="text-sm text-gray-600">Input the user's identifier</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-medium">Review Results</p>
                <p className="text-sm text-gray-600">Check exclusion status and take appropriate action</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
