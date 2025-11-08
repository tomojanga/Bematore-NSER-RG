'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Phone, Lock, Eye, EyeOff, User, Mail, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    password: '',
    confirm_password: '',
    user_type: 'citizen' as 'citizen' | 'operator'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear the error for the changed field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    // Special validations on change
    if (field === 'phone_number') {
      // Keep only numbers and ensure starts with 254
      const cleaned = value.replace(/\D/g, '')
      if (cleaned !== value) {
        setFormData(prev => ({ ...prev, [field]: cleaned }))
      }
    } else if (field === 'email') {
      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (value && !emailRegex.test(value)) {
        setErrors(prev => ({ ...prev, email: 'Invalid email format' }))
      }
    } else if (field === 'password') {
      // Password strength indicator
      if (value.length > 0 && value.length < 8) {
        setErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters' }))
      }
    } else if (field === 'confirm_password') {
      // Password match validation
      if (value !== formData.password) {
        setErrors(prev => ({ ...prev, confirm_password: 'Passwords do not match' }))
      }
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^254[0-9]{9}$/
    const today = new Date()
    const birthDate = new Date(formData.date_of_birth)
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    // Name validations
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required'
    } else if (formData.first_name.length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters'
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required'
    } else if (formData.last_name.length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    // Phone validation
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required'
    } else if (!phoneRegex.test(formData.phone_number)) {
      newErrors.phone_number = 'Phone must be in format 254XXXXXXXXX'
    }

    // Date of birth validation
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required'
    } else if (birthDate > today) {
      newErrors.date_of_birth = 'Date of birth cannot be in the future'
    } else if (age < 18 || (age === 18 && monthDiff < 0)) {
      newErrors.date_of_birth = 'You must be at least 18 years old'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter'
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter'
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number'
    }

    // Confirm password validation
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password'
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting",
        variant: "destructive"
      })
      return
    }

    setIsRegistering(true)
    setErrors({})
    
    try {
      // Get device info for registration
      const deviceInfo = {
        name: window.navigator.userAgent,
        type: navigator.platform,
        os: window.navigator.platform,
        browser: window.navigator.userAgent.split(' ').pop() || 'unknown',
        trusted: true
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          device_info: deviceInfo
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Account created successfully. Please check your email for verification.",
          variant: "default"
        })
        router.push('/login?registered=true')
      } else {
        // Handle different types of errors
        if (data.errors) {
          // Field-specific validation errors
          const fieldErrors: Record<string, string> = {}
          Object.entries(data.errors).forEach(([field, messages]) => {
            fieldErrors[field] = Array.isArray(messages) ? messages[0] : messages as string
          })
          setErrors(fieldErrors)
        } else if (data.code === 'phone_exists') {
          setErrors({ phone_number: 'This phone number is already registered.' })
        } else if (data.code === 'email_exists') {
          setErrors({ email: 'This email is already registered.' })
        } else {
          // General error message
          setErrors({ general: data.message || 'Registration failed. Please try again.' })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive"
      })
      setErrors({ general: 'Network error. Please try again.' })
    } finally {
      setIsRegistering(false)
    }
    e.preventDefault()
    
    if (!validateForm()) return

    setIsRegistering(true)
    setErrors({})
    
    try {
      // Get device info for the registration
      const deviceInfo = {
        name: window.navigator.userAgent,
        type: navigator.platform,
        os: window.navigator.platform,
        browser: window.navigator.userAgent.split(' ').pop() || 'unknown',
        trusted: true
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          device_info: deviceInfo
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Registration successful
        router.push('/login?registered=true')
      } else {
        // Handle different types of errors
        if (data.errors) {
          // Field-specific validation errors
          const fieldErrors: Record<string, string> = {}
          Object.entries(data.errors).forEach(([field, messages]) => {
            fieldErrors[field] = Array.isArray(messages) ? messages[0] : messages as string
          })
          setErrors(fieldErrors)
        } else if (data.code === 'phone_exists') {
          setErrors({ phone_number: 'This phone number is already registered.' })
        } else if (data.code === 'email_exists') {
          setErrors({ email: 'This email is already registered.' })
        } else {
          // General error message
          setErrors({ general: data.message || 'Registration failed. Please try again.' })
        }
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' })
    } finally {
      setIsRegistering(false)
    }
    e.preventDefault()

    if (!validateForm()) return

    setIsRegistering(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone_number: formData.phone_number,
          date_of_birth: formData.date_of_birth,
          password: formData.password,
          user_type: formData.user_type,
          terms_accepted: true,
          privacy_policy_accepted: true,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push('/login?message=Registration successful. Please login.')
      } else {
        const errorData = await response.json()
        console.error('Registration failed with response:', errorData)
        setErrors({ general: errorData.message || errorData.detail || errorData.email?.[0] || errorData.phone_number?.[0] || 'Registration failed' })
      }
    } catch (error) {
      console.error('Registration error:', error)
      // Try to get more specific error message
      if (error instanceof Response) {
        try {
          const errorData = await error.json()
          setErrors({ general: errorData.message || errorData.detail || 'Registration failed' })
        } catch {
          setErrors({ general: 'Registration failed' })
        }
      } else {
        setErrors({ general: 'Network error. Please try again.' })
      }
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-full mb-4">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join the NSER & RG Platform</p>
        </div>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleInputChange('user_type', 'citizen')}
                className={`p-3 border rounded-lg text-center transition-all ${
                  formData.user_type === 'citizen'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <User className="h-5 w-5 mx-auto mb-1" />
                <span className="text-sm font-medium">Citizen</span>
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('user_type', 'operator')}
                className={`p-3 border rounded-lg text-center transition-all ${
                  formData.user_type === 'operator'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <Shield className="h-5 w-5 mx-auto mb-1" />
                <span className="text-sm font-medium">Operator</span>
              </button>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.first_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="John"
                  required
                />
              </div>
              {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.last_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Doe"
                  required
                />
              </div>
              {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="john.doe@example.com"
                required
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phone_number ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="254712345678"
                required
              />
            </div>
            {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>}
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.date_of_birth ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
            </div>
            {errors.date_of_birth && <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="confirm_password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirm_password}
                onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.confirm_password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirm_password && <p className="text-red-500 text-sm mt-1">{errors.confirm_password}</p>}
          </div>

          <button
            type="submit"
            disabled={isRegistering}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isRegistering ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign in here
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Protected by GRAK © 2025</p>
        </div>
      </div>
    </div>
  )
}