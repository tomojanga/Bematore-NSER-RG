'use client'

import React, { useState } from 'react'
import { useRealTimeExclusionLookup, useBulkExclusionLookup, useBSTExclusionLookup } from '@/hooks/useExclusions'
import { useTokenValidationPerformance } from '@/hooks/useBSTTokens'
import { useOperatorHelpers } from '@/hooks/useOperators'
import { Card, CardContent, CardHeader, CardTitle, StatusBadge, RiskBadge } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Table } from '@/components/ui/Table'
import { Search, User, Shield, Clock, AlertTriangle, CheckCircle, X, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function UserLookupPage() {
  const [lookupType, setLookupType] = useState<'single' | 'bulk' | 'bst'>('single')
  const [singleFormData, setSingleFormData] = useState({
    phone_number: '',
    national_id: '',
    email: ''
  })
  const [bulkData, setBulkData] = useState('')
  const [bstToken, setBstToken] = useState('')
  const [lookupResults, setLookupResults] = useState<any[]>([])

  const { lookup, isLookingUp, lookupResult } = useRealTimeExclusionLookup()
  const { mutate: bulkLookup, isPending: isBulkLookingUp, data: bulkResults } = useBulkExclusionLookup()
  const { mutate: bstLookup, isPending: isBstLookingUp, data: bstResult } = useBSTExclusionLookup()
  const { validateWithPerf, isValidating, validationResult } = useTokenValidationPerformance()

  const handleSingleLookup = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Remove empty fields
    const lookupData = Object.entries(singleFormData).reduce((acc, [key, value]) => {
      if (value.trim()) acc[key] = value.trim()
      return acc
    }, {} as any)
    
    if (Object.keys(lookupData).length === 0) {
      return
    }
    
    lookup(lookupData)
  }

  const handleBulkLookup = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Parse bulk data (CSV format: phone,national_id,email)
    const lines = bulkData.split('\n').filter(line => line.trim())
    const users = lines.slice(1).map(line => {
      const [phone_number, national_id, email] = line.split(',').map(s => s.trim())
      return { phone_number, national_id, email }
    })
    
    if (users.length > 100) {
      alert('Maximum 100 users allowed per bulk lookup')
      return
    }
    
    bulkLookup({ users })
  }

  const handleBSTLookup = (e: React.FormEvent) => {
    e.preventDefault()
    if (bstToken.trim()) {
      bstLookup(bstToken.trim())
      validateWithPerf(bstToken.trim()) // Also validate token performance
    }
  }

  const clearResults = () => {
    setLookupResults([])
    setSingleFormData({ phone_number: '', national_id: '', email: '' })
    setBulkData('')
    setBstToken('')
  }

  // Results display component
  const LookupResultCard = ({ result, responseTime }: { result: any, responseTime?: number }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'h-10 w-10 rounded-full flex items-center justify-center',
              result.is_excluded ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
            )}>
              {result.is_excluded ? <X className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {result.is_excluded ? 'EXCLUDED USER' : 'NOT EXCLUDED'}
              </p>
              <p className="text-sm text-gray-600">
                Phone: {result.phone_number || 'N/A'}
              </p>
            </div>
          </div>
          
          {responseTime && (
            <div className="text-right">
              <div className={cn('text-sm font-medium', {
                'text-green-600': responseTime < 50,
                'text-yellow-600': responseTime >= 50 && responseTime < 100,
                'text-red-600': responseTime >= 100
              })}>
                {responseTime}ms
              </div>
              <p className="text-xs text-gray-500">Response Time</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">BST Token</p>
            <p className="font-mono text-xs">{result.bst_token?.substring(0, 20) || 'N/A'}...</p>
          </div>
          <div>
            <p className="text-gray-600">Risk Level</p>
            {result.risk_level ? (
              <RiskBadge riskLevel={result.risk_level} />
            ) : (
              <span className="text-gray-400">Not assessed</span>
            )}
          </div>
          <div>
            <p className="text-gray-600">Last Assessment</p>
            <p className="text-gray-900">
              {result.last_assessment ? 
                new Date(result.last_assessment).toLocaleDateString() : 
                'Never'
              }
            </p>
          </div>
          <div>
            <p className="text-gray-600">Screening Required</p>
            <StatusBadge status={result.requires_screening ? 'required' : 'not_required'} />
          </div>
        </div>

        {result.is_excluded && result.exclusion_details && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-900 mb-2">Exclusion Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-red-700">Period:</span>
                <span className="ml-2">{result.exclusion_details.period}</span>
              </div>
              <div>
                <span className="text-red-700">Expires:</span>
                <span className="ml-2">{new Date(result.exclusion_details.expiry_date).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-red-700">Reference:</span>
                <span className="ml-2 font-mono">{result.exclusion_details.reference}</span>
              </div>
              <div>
                <span className="text-red-700">Days Remaining:</span>
                <span className="ml-2">{result.exclusion_details.days_remaining}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Exclusion Lookup</h1>
        <p className="text-gray-600 mt-1">
          Real-time checking for user exclusion status across the national registry
        </p>
      </div>

      {/* Performance Notice */}
      <Card>
        <CardContent className="p-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-4">
            <Clock className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900">Performance Target</h3>
              <p className="text-sm text-blue-700">
                Exclusion lookups must complete within <strong>50ms</strong> (regulatory requirement)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lookup Type Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setLookupType('single')}
          className={cn(
            'flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            lookupType === 'single' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
          )}
        >
          Single User Lookup
        </button>
        <button
          onClick={() => setLookupType('bulk')}
          className={cn(
            'flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            lookupType === 'bulk' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
          )}
        >
          Bulk Lookup (CSV)
        </button>
        <button
          onClick={() => setLookupType('bst')}
          className={cn(
            'flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            lookupType === 'bst' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
          )}
        >
          BST Token Lookup
        </button>
      </div>

      {/* Single User Lookup */}
      {lookupType === 'single' && (
        <Card>
          <CardHeader>
            <CardTitle>Single User Lookup</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSingleLookup} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Phone Number"
                  type="tel"
                  value={singleFormData.phone_number}
                  onChange={(e) => setSingleFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                  placeholder="254712345678"
                  helper="Include country code"
                />
                
                <Input
                  label="National ID"
                  value={singleFormData.national_id}
                  onChange={(e) => setSingleFormData(prev => ({ ...prev, national_id: e.target.value }))}
                  placeholder="12345678"
                  helper="8-digit ID number"
                />
                
                <Input
                  label="Email Address"
                  type="email"
                  value={singleFormData.email}
                  onChange={(e) => setSingleFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="user@example.com"
                  helper="Optional identifier"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-700">
                  <strong>Note:</strong> Provide at least one identifier. Phone number or National ID recommended for best results.
                </p>
              </div>

              <Button
                type="submit"
                loading={isLookingUp}
                className="w-full"
                disabled={!singleFormData.phone_number && !singleFormData.national_id && !singleFormData.email}
              >
                <Search className="h-4 w-4 mr-2" />
                Lookup User
              </Button>
            </form>

            {/* Single Lookup Result */}
            {lookupResult && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Lookup Result</h3>
                <LookupResultCard 
                  result={lookupResult} 
                  responseTime={lookupResult.client_response_time_ms}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bulk Lookup */}
      {lookupType === 'bulk' && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Lookup (CSV)</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBulkLookup} className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Upload CSV data with headers: phone_number,national_id,email
                </p>
                <Textarea
                  value={bulkData}
                  onChange={(e) => setBulkData(e.target.value)}
                  placeholder={`phone_number,national_id,email\n254712345678,12345678,user1@example.com\n254787654321,87654321,user2@example.com`}
                  rows={8}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum 100 users per lookup. Empty fields are allowed.
                </p>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CSV File
                </Button>
                <Button
                  type="submit"
                  loading={isBulkLookingUp}
                  className="flex-1"
                  disabled={!bulkData.trim()}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Bulk Lookup
                </Button>
              </div>
            </form>

            {/* Bulk Results */}
            {bulkResults && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Bulk Lookup Results</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">
                      {bulkResults.data?.results?.filter((r: any) => r.is_excluded).length || 0} excluded
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-600">
                      {bulkResults.data?.results?.length || 0} total
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {bulkResults.data?.results?.map((result: any, index: number) => (
                    <LookupResultCard key={index} result={result} />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* BST Token Lookup */}
      {lookupType === 'bst' && (
        <Card>
          <CardHeader>
            <CardTitle>BST Token Lookup & Validation</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBSTLookup} className="space-y-4">
              <Input
                label="BST Token"
                value={bstToken}
                onChange={(e) => setBstToken(e.target.value)}
                placeholder="BST-02-A7F3E9D2C1B8F4A6E3D9C7B2F1A8E5D3-C4B9"
                helper="Enter the complete BST token for validation and exclusion lookup"
                className="font-mono"
              />

              <Button
                type="submit"
                loading={isBstLookingUp || isValidating}
                disabled={!bstToken.trim()}
                className="w-full"
              >
                <Search className="h-4 w-4 mr-2" />
                Validate & Lookup
              </Button>
            </form>

            {/* BST Results */}
            {(bstResult || validationResult) && (
              <div className="mt-6 space-y-4">
                {/* Token Validation Result */}
                {validationResult && (
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-3">Token Validation</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Valid</p>
                        <StatusBadge status={validationResult.is_valid ? 'valid' : 'invalid'} />
                      </div>
                      <div>
                        <p className="text-gray-600">Response Time</p>
                        <span className={cn('font-medium', {
                          'text-green-600': (validationResult.response_time_ms || 0) < 20,
                          'text-yellow-600': (validationResult.response_time_ms || 0) >= 20 && (validationResult.response_time_ms || 0) < 50,
                          'text-red-600': (validationResult.response_time_ms || 0) >= 50
                        })}>
                          {validationResult.response_time_ms || validationResult.client_response_time_ms}ms
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-600">User ID</p>
                        <p className="font-mono text-xs">{validationResult.user_id || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Active</p>
                        <StatusBadge status={validationResult.is_active ? 'active' : 'inactive'} />
                      </div>
                    </div>
                    
                    {!validationResult.is_valid && (
                      <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                        <p className="text-sm text-red-700">
                          <strong>Validation Failed:</strong> {validationResult.validation_message}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Exclusion Lookup Result */}
                {bstResult && (
                  <LookupResultCard 
                    result={bstResult.data} 
                    responseTime={bstResult.client_response_time_ms}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <User className="h-6 w-6" />
              <span className="font-medium">Register New User</span>
              <span className="text-xs text-gray-500">Add user to your platform</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Shield className="h-6 w-6" />
              <span className="font-medium">Report Exclusion Breach</span>
              <span className="text-xs text-gray-500">Report violation attempt</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Clock className="h-6 w-6" />
              <span className="font-medium">View Lookup History</span>
              <span className="text-xs text-gray-500">Recent lookup activities</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Integration Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Required Implementation</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Registration Process</h5>
                <ul className="space-y-1 text-gray-600">
                  <li>• Check user exclusion before account creation</li>
                  <li>• Block registration if excluded</li>
                  <li>• Generate BST token for new users</li>
                  <li>• Trigger quarterly screening schedule</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Transaction Process</h5>
                <ul className="space-y-1 text-gray-600">
                  <li>• Check exclusion before every bet</li>
                  <li>• Block all gambling activities if excluded</li>
                  <li>• Log all lookup attempts for audit</li>
                  <li>• Report compliance weekly to GRAK</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clear Results Button */}
      {(lookupResult || bulkResults || bstResult) && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={clearResults}>
            Clear Results
          </Button>
        </div>
      )}
    </div>
  )
}