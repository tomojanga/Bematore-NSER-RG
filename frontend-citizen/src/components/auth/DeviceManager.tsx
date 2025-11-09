import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { Device } from '@/types/auth'
import { identifyDevice } from '@/store/deviceStore'

interface DeviceManagerProps {
  onTrustDevice?: () => void
}

export function DeviceManager({ onTrustDevice }: DeviceManagerProps) {
  const { 
    devices, 
    isLoadingProfile,
    trustDevice,
    revokeDevice,
    isTrustingDevice,
    isRevokingDevice,
    refetchDevices
  } = useAuth()
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null)
  const [isInitialSync, setIsInitialSync] = useState(true)
  const { toast } = useToast()

  // Initial device identification
  useEffect(() => {
    try {
      const deviceId = identifyDevice()
      if (!deviceId) {
        throw new Error('Failed to identify device')
      }
      setCurrentDeviceId(deviceId)
    } catch (error) {
      console.error('Device identification failed:', error)
      toast({
        title: "Warning",
        description: "Could not identify your device. Some features may be limited.",
        variant: "destructive",
        duration: 5000
      })
    }
  }, [toast])

  // Device trust status synchronization
  useEffect(() => {
    if (!currentDeviceId || !isInitialSync) return
    
    try {
      const isTrusted = localStorage.getItem('device_trusted') === 'true'
      const currentDevice = devices.find(d => d.id === currentDeviceId)

      if (!currentDevice) {
        // Device not found in backend - clear trust status
        localStorage.removeItem('device_trusted')
        setIsInitialSync(false)
        return
      }

      if (isTrusted && !currentDevice.trusted) {
        // Re-sync trust status with backend
        trustDevice(currentDeviceId)
          .catch((error) => {
            console.error('Failed to sync device trust status:', error)
            localStorage.removeItem('device_trusted')
            toast({
              title: "Warning",
              description: "Failed to verify device trust status. Please try again.",
              variant: "destructive",
              duration: 5000
            })
          })
          .finally(() => {
            setIsInitialSync(false)
          })
      } else if (!isTrusted && currentDevice.trusted) {
        // Update local storage to match backend
        localStorage.setItem('device_trusted', 'true')
        setIsInitialSync(false)
      } else {
        setIsInitialSync(false)
      }
    } catch (error) {
      console.error('Trust status sync failed:', error)
      setIsInitialSync(false)
    }
  }, [devices, currentDeviceId, trustDevice, isInitialSync, toast])

  const handleTrustDevice = async () => {
    if (!currentDeviceId) {
      toast({
        title: "Error",
        description: "Device ID not found. Please refresh the page.",
        variant: "destructive",
        duration: 5000
      })
      return
    }

    if (!navigator.onLine) {
      toast({
        title: "Error",
        description: "You need to be online to trust this device.",
        variant: "destructive",
        duration: 5000
      })
      return
    }

    try {
      await trustDevice(currentDeviceId)
      localStorage.setItem('device_trusted', 'true')
      onTrustDevice?.()
      await refetchDevices()
      
      toast({
        title: "Success",
        description: "Device trusted successfully. You can now use biometric authentication.",
        duration: 3000
      })
    } catch (error: any) {
      console.error('Failed to trust device:', error)
      localStorage.removeItem('device_trusted')
      toast({
        title: "Error",
        description: error.message || "Failed to trust device. Please try again.",
        variant: "destructive",
        duration: 5000
      })
    }
  }

  const handleRevokeDevice = async (deviceId: string) => {
    if (!deviceId) {
      toast({
        title: "Error",
        description: "Invalid device ID",
        variant: "destructive",
        duration: 5000
      })
      return
    }

    if (!navigator.onLine) {
      toast({
        title: "Error",
        description: "You need to be online to revoke device access.",
        variant: "destructive",
        duration: 5000
      })
      return
    }

    if (deviceId === currentDeviceId) {
      const confirmed = window.confirm(
        'Are you sure you want to revoke access for your current device? You will be logged out immediately.'
      )
      if (!confirmed) return
    }
    
    try {
      await revokeDevice(deviceId)
      
      if (deviceId === currentDeviceId) {
        localStorage.removeItem('device_trusted')
        localStorage.removeItem('device_id') // Clear device ID as well
      }
      
      await refetchDevices()
      
      toast({
        title: "Success",
        description: deviceId === currentDeviceId 
          ? "Current device access revoked. You will be logged out."
          : "Device access revoked successfully.",
        duration: 3000
      })
    } catch (error: any) {
      console.error('Failed to revoke device:', error)
      toast({
        title: "Error",
        description: "Failed to revoke device access. Please try again.",
        variant: "destructive"
      })
    }
  }

  const formatLastActive = (date: string) => {
    return new Date(date).toLocaleString()
  }

  if (isLoadingProfile || isInitialSync) {
    return (
      <div className="flex items-center justify-center p-4 text-gray-500">
        <div className="animate-spin mr-2">
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        Loading devices...
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Management</CardTitle>
        <CardDescription>Manage your trusted devices and active sessions</CardDescription>
      </CardHeader>
      <CardContent>
        {devices.map((device: Device) => (
          <div
            key={device.id}
            className="flex items-center justify-between p-4 border-b last:border-0"
          >
            <div>
              <div className="font-medium flex items-center gap-2">
                {device.name || `${device.browser} on ${device.os}`}
                {device.isCurrent && (
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Current</span>
                )}
                {device.trusted && (
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded">Trusted</span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Last active: {formatLastActive(device.lastActive)}
              </div>
              {device.location && (
                <div className="text-sm text-gray-500">
                  Location: {device.location}
                </div>
              )}
              <div className="text-sm text-gray-500">
                IP: {device.ip || 'Unknown'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {device.isCurrent && !device.trusted && (
                <Button
                  variant="outline"
                  onClick={handleTrustDevice}
                  disabled={isTrustingDevice}
                >
                  {isTrustingDevice ? 'Trusting...' : 'Trust Device'}
                </Button>
              )}
              {!device.isCurrent && (
                <Button
                  variant="destructive"
                  onClick={() => handleRevokeDevice(device.id)}
                  disabled={isRevokingDevice}
                >
                  {isRevokingDevice ? 'Revoking...' : 'Revoke Access'}
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}