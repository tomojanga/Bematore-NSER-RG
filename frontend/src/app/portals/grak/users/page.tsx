'use client'

import React, { useState } from 'react'
import { useUsers, useUserHelpers, useUserSearch } from '@/hooks/useUsers'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle, StatusBadge } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Table, ActionMenu } from '@/components/ui/Table'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import {
  Users,
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Shield,
  Phone,
  Mail,
  MapPin,
  Calendar,
  UserCheck,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function GRAKUsersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [verificationFilter, setVerificationFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Hooks
  const { 
    users, 
    total, 
    isLoading, 
    createUser, 
    updateUser, 
    deleteUser, 
    isCreating, 
    isUpdating, 
    isDeleting 
  } = useUsers({ 
    page, 
    page_size: 20, 
    search: searchQuery,
    status: statusFilter,
    role: roleFilter,
    verification_status: verificationFilter
  })
  
  const { mutate: searchUsers, data: searchResults, isPending: isSearching } = useUserSearch()
  const { 
    formatUserRole, 
    getRoleColor, 
    formatUserStatus, 
    getUserStatusColor, 
    formatVerificationStatus,
    getVerificationStatusColor,
    calculateAge,
    formatPhoneNumber,
    isUserVerified,
    getUserVerificationProgress
  } = useUserHelpers()

  const [newUserData, setNewUserData] = useState({
    phone_number: '',
    email: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    role: 'citizen',
    send_welcome_sms: true
  })

  // Filter options
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'locked', label: 'Locked' }
  ]

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'citizen', label: 'Citizen' },
    { value: 'operator_admin', label: 'Operator Admin' },
    { value: 'operator_user', label: 'Operator Staff' },
    { value: 'grak_admin', label: 'GRAK Admin' },
    { value: 'grak_officer', label: 'GRAK Officer' }
  ]

  const verificationOptions = [
    { value: '', label: 'All Verification Statuses' },
    { value: 'verified', label: 'Verified' },
    { value: 'pending', label: 'Pending' },
    { value: 'unverified', label: 'Unverified' },
    { value: 'failed', label: 'Failed' }
  ]

  // Table columns
  const columns = [
    {
      key: 'user_info',
      title: 'User Information',
      width: '300px',
      render: (value: any, user: any) => (
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
            {user.first_name?.[0]}{user.last_name?.[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900">
                {user.first_name} {user.last_name}
              </p>
              {isUserVerified(user) && (
                <UserCheck className="h-4 w-4 text-green-600" />
              )}
            </div>
            <p className="text-sm text-gray-600">{formatPhoneNumber(user.phone_number)}</p>
            {user.email && (
              <p className="text-xs text-gray-500">{user.email}</p>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Role',
      render: (value: any, user: any) => (
        <span className={cn('px-3 py-1 rounded-full text-xs font-medium', getRoleColor(user.role))}>
          {formatUserRole(user.role)}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: any, user: any) => (
        <div className="space-y-1">
          <StatusBadge status={user.status} />
          {user.is_locked && (
            <span className="block text-xs text-red-600">
              Locked until {new Date(user.locked_until).toLocaleDateString()}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'verification',
      title: 'Verification',
      render: (value: any, user: any) => {
        const progress = getUserVerificationProgress(user)
        return (
          <div className="space-y-1">
            <span className={cn('px-2 py-1 rounded text-xs font-medium', getVerificationStatusColor(user.verification_status))}>
              {formatVerificationStatus(user.verification_status)}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>{progress.percentage}% complete</span>
            </div>
          </div>
        )
      }
    },
    {
      key: 'location',
      title: 'Location',
      render: (value: any, user: any) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-gray-400" />
            <span>{user.city || 'N/A'}, {user.county || 'N/A'}</span>
          </div>
          <p className="text-xs text-gray-500">{user.country_code || 'KE'}</p>
        </div>
      )
    },
    {
      key: 'created_at',
      title: 'Registration',
      render: (value: any, user: any) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span>{new Date(user.created_at).toLocaleDateString()}</span>
          </div>
          {user.last_login_at && (
            <p className="text-xs text-gray-500">
              Last login: {new Date(user.last_login_at).toLocaleDateString()}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, user: any) => (
        <ActionMenu
          actions={[
            {
              label: 'View Details',
              onClick: () => {
                setSelectedUser(user)
                setShowDetailsModal(true)
              },
              icon: <Eye className="h-4 w-4" />
            },
            {
              label: 'Edit User',
              onClick: () => {
                setSelectedUser(user)
                // Will implement edit modal
              },
              icon: <Edit className="h-4 w-4" />
            },
            {
              label: 'Generate BST Token',
              onClick: () => {
                // Will implement BST token generation
              },
              icon: <Shield className="h-4 w-4" />
            },
            {
              label: 'Send Notification',
              onClick: () => {
                // Will implement notification sending
              },
              icon: <Mail className="h-4 w-4" />
            },
            {
              label: 'Delete User',
              onClick: () => {
                setSelectedUser(user)
                setShowDeleteModal(true)
              },
              icon: <Trash2 className="h-4 w-4" />,
              destructive: true
            }
          ]}
        />
      )
    }
  ]

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchUsers({
        query: searchQuery,
        filters: {
          role: roleFilter || undefined,
          status: statusFilter || undefined,
          verification_status: verificationFilter || undefined
        }
      })
    }
  }

  const handleCreateUser = () => {
    createUser({
      ...newUserData,
      password: Math.random().toString(36).slice(-8) // Temporary password
    })
    setShowCreateModal(false)
    setNewUserData({
      phone_number: '',
      email: '',
      first_name: '',
      last_name: '',
      middle_name: '',
      role: 'citizen',
      send_welcome_sms: true
    })
  }

  const handleDeleteUser = () => {
    if (selectedUser) {
      deleteUser({
        id: selectedUser.id,
        reason: 'Deleted by GRAK administrator'
      })
      setShowDeleteModal(false)
      setSelectedUser(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-1">
            Manage all registered users across the NSER platform
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => handleSearch()}>
            <Download className="h-4 w-4 mr-2" />
            Export Users
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New User
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Verified Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => isUserVerified(u)).length.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Self-Excluded</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.metadata?.has_exclusion).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Verification</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.verification_status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search by name, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            
            <Select
              placeholder="Filter by status"
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            
            <Select
              placeholder="Filter by role"
              options={roleOptions}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            />
            
            <Select
              placeholder="Filter by verification"
              options={verificationOptions}
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('')
                setRoleFilter('')
                setVerificationFilter('')
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({total.toLocaleString()})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            data={searchResults?.results || users}
            columns={columns}
            loading={isLoading || isSearching}
            pagination={{
              current: page,
              total: searchResults?.count || total,
              pageSize: 20,
              onPageChange: setPage,
              hasNext: true,
              hasPrevious: page > 1
            }}
            emptyMessage="No users found matching your criteria"
          />
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Add New User" size="lg">
        <form onSubmit={(e) => { e.preventDefault(); handleCreateUser(); }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              type="tel"
              value={newUserData.phone_number}
              onChange={(e) => setNewUserData(prev => ({ ...prev, phone_number: e.target.value }))}
              placeholder="254712345678"
              required
              leftIcon={<Phone className="h-4 w-4" />}
              helper="Include country code (254 for Kenya)"
            />
            
            <Input
              label="Email Address"
              type="email"
              value={newUserData.email}
              onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="user@example.com"
              leftIcon={<Mail className="h-4 w-4" />}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="First Name"
              value={newUserData.first_name}
              onChange={(e) => setNewUserData(prev => ({ ...prev, first_name: e.target.value }))}
              required
            />
            
            <Input
              label="Last Name"
              value={newUserData.last_name}
              onChange={(e) => setNewUserData(prev => ({ ...prev, last_name: e.target.value }))}
              required
            />
            
            <Input
              label="Middle Name"
              value={newUserData.middle_name}
              onChange={(e) => setNewUserData(prev => ({ ...prev, middle_name: e.target.value }))}
              placeholder="Optional"
            />
          </div>
          
          <Select
            label="User Role"
            options={roleOptions.filter(r => r.value)}
            value={newUserData.role}
            onChange={(e) => setNewUserData(prev => ({ ...prev, role: e.target.value }))}
            required
            helper="Assign appropriate role based on user responsibility"
          />
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="send_welcome_sms"
              checked={newUserData.send_welcome_sms}
              onChange={(e) => setNewUserData(prev => ({ ...prev, send_welcome_sms: e.target.checked }))}
              className="h-4 w-4 text-blue-600"
            />
            <label htmlFor="send_welcome_sms" className="text-sm text-gray-700">
              Send welcome SMS with login instructions
            </label>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> A temporary password will be generated and sent via SMS. 
              User will be required to change it on first login.
            </p>
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={isCreating}
              className="flex-1"
            >
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* User Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="User Details" size="xl">
        {selectedUser && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedUser.first_name} {selectedUser.middle_name} {selectedUser.last_name}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                    <p className="text-sm text-gray-900 mt-1">{formatPhoneNumber(selectedUser.phone_number)}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedUser.email || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedUser.date_of_birth ? 
                        `${new Date(selectedUser.date_of_birth).toLocaleDateString()} (${calculateAge(selectedUser.date_of_birth)} years old)` : 
                        'Not provided'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Role</label>
                    <div className="mt-1">
                      <span className={cn('px-3 py-1 rounded-full text-xs font-medium', getRoleColor(selectedUser.role))}>
                        {formatUserRole(selectedUser.role)}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      <StatusBadge status={selectedUser.status} />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Verification Status</label>
                    <div className="mt-1">
                      <span className={cn('px-2 py-1 rounded text-xs font-medium', getVerificationStatusColor(selectedUser.verification_status))}>
                        {formatVerificationStatus(selectedUser.verification_status)}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedUser.city}, {selectedUser.county} ({selectedUser.country_code})
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Progress */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={cn('p-4 rounded-lg border-2', {
                  'bg-green-50 border-green-200': selectedUser.is_phone_verified,
                  'bg-red-50 border-red-200': !selectedUser.is_phone_verified
                })}>
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm font-medium">Phone Verification</span>
                  </div>
                  <StatusBadge status={selectedUser.is_phone_verified ? 'verified' : 'pending'} />
                </div>
                
                <div className={cn('p-4 rounded-lg border-2', {
                  'bg-green-50 border-green-200': selectedUser.is_email_verified,
                  'bg-red-50 border-red-200': !selectedUser.is_email_verified
                })}>
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm font-medium">Email Verification</span>
                  </div>
                  <StatusBadge status={selectedUser.is_email_verified ? 'verified' : 'pending'} />
                </div>
                
                <div className={cn('p-4 rounded-lg border-2', {
                  'bg-green-50 border-green-200': selectedUser.is_id_verified,
                  'bg-red-50 border-red-200': !selectedUser.is_id_verified
                })}>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">ID Verification</span>
                  </div>
                  <StatusBadge status={selectedUser.is_id_verified ? 'verified' : 'pending'} />
                </div>
              </div>
            </div>

            {/* Security Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Account Status:</span>
                    <StatusBadge status={selectedUser.is_active ? 'active' : 'inactive'} />
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-700">2FA Enabled:</span>
                    <span className={selectedUser.is_2fa_enabled ? 'text-green-600' : 'text-red-600'}>
                      {selectedUser.is_2fa_enabled ? 'Yes' : 'No'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-700">Failed Login Attempts:</span>
                    <span className={cn({
                      'text-green-600': selectedUser.failed_login_attempts === 0,
                      'text-yellow-600': selectedUser.failed_login_attempts > 0 && selectedUser.failed_login_attempts < 3,
                      'text-red-600': selectedUser.failed_login_attempts >= 3
                    })}>
                      {selectedUser.failed_login_attempts}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-700">Account Locked:</span>
                    <span className={selectedUser.is_locked ? 'text-red-600' : 'text-green-600'}>
                      {selectedUser.is_locked ? `Until ${new Date(selectedUser.locked_until).toLocaleDateString()}` : 'No'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Last Login:</span>
                    <span className="text-gray-900">
                      {selectedUser.last_login_at ? 
                        new Date(selectedUser.last_login_at).toLocaleDateString() : 
                        'Never'
                      }
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-700">Last Login IP:</span>
                    <span className="text-gray-900">{selectedUser.last_login_ip || 'N/A'}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-700">Registration Date:</span>
                    <span className="text-gray-900">{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-700">Last Updated:</span>
                    <span className="text-gray-900">{new Date(selectedUser.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete user "${selectedUser?.first_name} ${selectedUser?.last_name}"? This action cannot be undone and will trigger a compliance audit.`}
        confirmText="Delete User"
        cancelText="Cancel"
        type="danger"
        loading={isDeleting}
      />
    </div>
  )
}