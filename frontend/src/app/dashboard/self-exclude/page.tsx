'use client'

import React, { useState } from 'react'
import { useExclusions, useCanSelfExclude, useExclusionFormatters } from '@/hooks/useExclusions'
import { useCurrentRiskScore } from '@/hooks/useAssessments'
import { useAuth } from '@/hooks/useAuth'
import { ExclusionPeriod } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, StatusBadge, RiskBadge, ProgressBar } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { Shield, AlertTriangle, Clock, CheckCircle, Phone, Mail, Info } from 'lucide-react'

export default function SelfExclusionPage() {
  const { user } = useAuth()
  const { canSelfExclude, reason, activeExclusion } = useCanSelfExclude()
  const { data: currentRisk } = useCurrentRiskScore()
  const { createExclusion, isCreating } = useExclusions()
  const { formatPeriod, formatDaysRemaining, calculateProgress } = useExclusionFormatters()
  
  const [showForm, setShowForm] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [formData, setFormData] = useState({
    exclusion_period: '',
    custom_period_days: '',
    reason: '',
    motivation_type: '',
    terms_accepted: false
  })

  const exclusionPeriods = [
    { value: '6_months', label: '6 Months' },
    { value: '1_year', label: '1 Year' },
    { value: '5_years', label: '5 Years' },
    { value: 'permanent', label: 'Permanent (5 years with auto-renewal)' },
    { value: 'custom', label: 'Custom Period' }
  ]

  const motivationTypes = [
    { value: 'financial_loss', label: 'Financial Losses' },
    { value: 'relationship_issues', label: 'Relationship Issues' },
    { value: 'mental_health', label: 'Mental Health Concerns' },
    { value: 'addiction', label: 'Addiction Concerns' },
    { value: 'precaution', label: 'Precautionary Measure' },
    { value: 'other', label: 'Other' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowConfirm(true)
  }

  const confirmExclusion = () => {
    const exclusionData = {
      exclusion_period: formData.exclusion_period as ExclusionPeriod,
      custom_period_days: formData.exclusion_period === 'custom' ? parseInt(formData.custom_period_days) : undefined,
      reason: formData.reason,
      motivation_type: formData.motivation_type as any || undefined,
      is_auto_renewable: formData.exclusion_period === 'permanent'
    }
    
    createExclusion(exclusionData)
    setShowConfirm(false)
    setShowForm(false)
  }

  // If user already has active exclusion, show status
  if (activeExclusion) {
    const progress = calculateProgress(activeExclusion.effective_date, activeExclusion.expiry_date)
    const daysRemaining = activeExclusion.days_remaining || 0
    
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">You Are Currently Self-Excluded</h1>
          <p className="text-gray-600 mt-2">Your gambling activities are restricted across all licensed operators in Kenya</p>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Exclusion Period</h3>
                <div className="text-2xl font-bold text-blue-600">
                  {formatPeriod(activeExclusion.exclusion_period)}
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Time Remaining</h3>
                <div className="text-2xl font-bold text-orange-600">
                  {formatDaysRemaining(daysRemaining)}
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Status</h3>
                <StatusBadge status={activeExclusion.status} />
              </div>
            </div>

            <ProgressBar
              value={progress}
              label="Exclusion Progress"
              color={progress > 75 ? 'green' : progress > 50 ? 'yellow' : 'blue'}
              className="mb-6"
            />

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Exclusion Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Reference:</span>
                  <span className="ml-2 font-mono">{activeExclusion.exclusion_reference}</span>
                </div>
                <div>
                  <span className="text-blue-700">Effective Date:</span>
                  <span className="ml-2">{new Date(activeExclusion.effective_date).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-blue-700">Expires On:</span>
                  <span className="ml-2">{new Date(activeExclusion.expiry_date).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-blue-700">Propagation:</span>
                  <StatusBadge status={activeExclusion.propagation_status} />
                </div>
              </div>
            </div>

            {activeExclusion.can_terminate_early && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-2">Early Termination Request</h4>
                  <p className="text-sm text-yellow-700 mb-4">
                    You may request early termination of your exclusion. This requires administrative approval.
                  </p>
                  <Button variant="outline" size="sm">
                    Request Early Termination
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Support Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Support Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Phone className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <h4 className="font-semibold text-purple-900">Crisis Helpline</h4>
                <p className="text-sm text-purple-700 mt-1">0800-GAMBLE (24/7)</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Mail className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <h4 className="font-semibold text-green-900">Email Support</h4>
                <p className="text-sm text-green-700 mt-1">support@nser-rg.ke</p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Info className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <h4 className="font-semibold text-blue-900">Online Resources</h4>
                <p className="text-sm text-blue-700 mt-1">Self-help tools & guides</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If user cannot self-exclude, show reason
  if (!canSelfExclude) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto text-center">
        <AlertTriangle className="h-16 w-16 mx-auto text-yellow-500" />
        <h1 className="text-3xl font-bold text-gray-900">Self-Exclusion Not Available</h1>
        <p className="text-gray-600">{reason}</p>
        
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-700">
              If you need immediate help with gambling concerns, please contact our 24/7 crisis helpline:
            </p>
            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
              <p className="font-semibold text-purple-900">Crisis Helpline: 0800-GAMBLE</p>
              <p className="text-sm text-purple-700">Free, confidential support available 24/7</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main self-exclusion form
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <Shield className="h-16 w-16 mx-auto text-blue-600 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900">Self-Exclusion Registration</h1>
        <p className="text-gray-600 mt-2">
          Take control of your gambling activities across all licensed operators in Kenya
        </p>
      </div>

      {/* Current Risk Status */}
      {currentRisk?.data && (
        <Card>
          <CardHeader>
            <CardTitle>Your Current Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <RiskBadge riskLevel={currentRisk.data.risk_level} />
                <p className="text-sm text-gray-600 mt-1">Current Risk Level</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{currentRisk.data.risk_score}</div>
                <p className="text-sm text-gray-600">Risk Score</p>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-900">
                  {new Date(currentRisk.data.score_date).toLocaleDateString()}
                </div>
                <p className="text-sm text-gray-600">Last Assessment</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      <Card>
        <CardContent className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Important Information</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Self-exclusion applies to ALL licensed operators in Kenya</li>
              <li>• Exclusions are enforced within 5 seconds across all platforms</li>
              <li>• You cannot reverse an exclusion once activated</li>
              <li>• Support resources remain available throughout your exclusion</li>
              <li>• Early termination requires administrative approval</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Self-Exclusion Form */}
      <Card>
        <CardHeader>
          <CardTitle>Register for Self-Exclusion</CardTitle>
        </CardHeader>
        <CardContent>
          {!showForm ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-6">
                Ready to take the important step of self-exclusion?
              </p>
              <Button
                onClick={() => setShowForm(true)}
                variant="primary"
                size="lg"
                className="px-8"
              >
                Start Self-Exclusion Process
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Select
                label="Exclusion Period"
                options={exclusionPeriods}
                value={formData.exclusion_period}
                onChange={(e) => setFormData(prev => ({ ...prev, exclusion_period: e.target.value }))}
                placeholder="Select exclusion period"
                required
                helper="Choose how long you want to be excluded from gambling"
              />

              {formData.exclusion_period === 'custom' && (
                <Input
                  type="number"
                  label="Custom Period (Days)"
                  value={formData.custom_period_days}
                  onChange={(e) => setFormData(prev => ({ ...prev, custom_period_days: e.target.value }))}
                  placeholder="Enter number of days (minimum 30)"
                  min="30"
                  max="1825"
                  required
                  helper="Minimum 30 days, maximum 5 years (1825 days)"
                />
              )}

              <Select
                label="Primary Motivation"
                options={motivationTypes}
                value={formData.motivation_type}
                onChange={(e) => setFormData(prev => ({ ...prev, motivation_type: e.target.value }))}
                placeholder="Select your primary reason"
                helper="This helps us provide appropriate support resources"
              />

              <Textarea
                label="Additional Details (Optional)"
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Share any additional context that might help us support you better..."
                rows={4}
                helper="Optional: Provide more details about your situation"
                maxLength={1000}
              />

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Important: Please Read Carefully
                </h4>
                <div className="space-y-2 text-sm text-red-700">
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={formData.terms_accepted}
                      onChange={(e) => setFormData(prev => ({ ...prev, terms_accepted: e.target.checked }))}
                      required
                      className="mt-0.5"
                    />
                    <span>
                      I understand that self-exclusion is <strong>immediate and irreversible</strong>. 
                      I will be excluded from ALL licensed gambling operators in Kenya for the selected period.
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={!formData.terms_accepted}
                  className="flex-1"
                >
                  Proceed to Confirmation
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Support Resources Always Available */}
      <Card>
        <CardHeader>
          <CardTitle>Get Help & Support</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <Phone className="h-6 w-6 text-purple-600" />
                <h4 className="font-semibold text-purple-900">24/7 Crisis Helpline</h4>
              </div>
              <p className="text-purple-700 font-semibold text-lg">0800-GAMBLE</p>
              <p className="text-sm text-purple-600 mt-1">Free, confidential support</p>
              <Button variant="outline" size="sm" className="mt-3">
                Call Now
              </Button>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="h-6 w-6 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Email Support</h4>
              </div>
              <p className="text-blue-700">support@nser-rg.ke</p>
              <p className="text-sm text-blue-600 mt-1">Professional guidance available</p>
              <Button variant="outline" size="sm" className="mt-3">
                Send Email
              </Button>
            </div>
          </div>
          
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Online Resources</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-gray-700">Self-Help Tools</h5>
                <ul className="text-gray-600 mt-1 space-y-1">
                  <li>• Spending trackers</li>
                  <li>• Time management</li>
                  <li>• Goal setting</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-700">Educational Content</h5>
                <ul className="text-gray-600 mt-1 space-y-1">
                  <li>• Understanding addiction</li>
                  <li>• Recovery resources</li>
                  <li>• Family support</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-700">Community</h5>
                <ul className="text-gray-600 mt-1 space-y-1">
                  <li>• Support groups</li>
                  <li>• Peer networks</li>
                  <li>• Recovery stories</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmExclusion}
        title="Confirm Self-Exclusion"
        message={`Are you sure you want to self-exclude for ${formatPeriod(formData.exclusion_period)}? This action cannot be undone.`}
        confirmText="Yes, Exclude Me"
        cancelText="Cancel"
        type="danger"
        loading={isCreating}
      />
    </div>
  )
}