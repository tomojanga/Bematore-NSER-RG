import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { Device } from '@/types/auth'
import { identifyDevice } from '@/store/deviceStore'

interface DeviceManagerProps {
  onTrustDevice?: () => void
}

export function DeviceManager({ onTrustDevice }: DeviceManagerProps) {
  const { devices, isLoadingProfile } = useAuth()
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Identify current device
    const deviceId = identifyDevice()
    setCurrentDeviceId(deviceId)
  }, [])

  const handleTrustDevice = async () => {
    if (!currentDeviceId) return

    try {
      // Mark device as trusted in local storage
      localStorage.setItem('device_trusted', 'true')
      
      // Optional callback
      onTrustDevice?.()
      
      toast({
        title: 'Device Trusted',
        description: 'This device has been marked as trusted.',
      })
    } catch (error) {
      console.error('Failed to trust device:', error)
      toast({
        title: 'Error',
        description: 'Failed to trust device. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const formatLastActive = (date: string) => {
    return new Date(date).toLocaleString()
  }

  if (isLoadingProfile) {
    return <div>Loading devices...</div>
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
              <div className="font-medium">
                {device.name || `${device.browser} on ${device.os}`}
                {device.isCurrent && ' (Current)'}
              </div>
              <div className="text-sm text-gray-500">
                Last active: {formatLastActive(device.lastActive)}
              </div>
              {device.location && (
                <div className="text-sm text-gray-500">
                  Location: {device.location}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {device.isCurrent && !localStorage.getItem('device_trusted') && (
                <Button
                  variant="outline"
                  onClick={handleTrustDevice}
                >
                  Trust Device
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}