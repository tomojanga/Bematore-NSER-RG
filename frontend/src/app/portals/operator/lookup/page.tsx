'use client'

import { useState } from 'react'
import { useExclusionLookup } from '@/hooks/useExclusions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Search, Shield, AlertCircle, CheckCircle } from 'lucide-react'

export default function OperatorLookupPage() {
  const [phone, setPhone] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [bstToken, setBstToken] = useState('')
  const { mutate: lookup, isPending, data } = useExclusionLookup()

  const handleLookup = () => {
    lookup({ phone_number: phone, national_id: nationalId, bst_token: bstToken })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Lookup</h1>
        <p className="text-gray-600 mt-1">Check if a user is self-excluded</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search User</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Phone Number (+254...)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              placeholder="National ID"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
            />
            <Input
              placeholder="BST Token"
              value={bstToken}
              onChange={(e) => setBstToken(e.target.value)}
            />
            <Button onClick={handleLookup} disabled={isPending} className="w-full">
              <Search className="h-4 w-4 mr-2" />
              {isPending ? 'Checking...' : 'Check Exclusion Status'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {data && (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            {data.data?.is_excluded ? (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">User is Self-Excluded</p>
                  <p className="text-sm text-red-700">This user cannot participate in gambling activities</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">User is Not Excluded</p>
                  <p className="text-sm text-green-700">User can participate in gambling activities</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
