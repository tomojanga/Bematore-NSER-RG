import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/use-toast'
import { Monitor, Smartphone, Laptop, TabletSmartphone, XCircle } from 'lucide-react'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { Device } from '@/types/auth'

export function DeviceManagement() {
  const { toast } = useToast()
  const { 
    devices, 
    revokeDevice, 
    trustDevice, 
    isRevokingDevice, 
    isTrustingDevice,
    refetchDevices 
  } = useAuth()
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [showConfirmRevoke, setShowConfirmRevoke] = useState(false)
  const [showDeviceDetails, setShowDeviceDetails] = useState(false)

  const loading = !devices

  const handleRevoke = async (device: Device) => {
    try {
      await revokeDevice(device.id)
      await refetchDevices()
      toast({
        title: "Success",
        description: "Device has been revoked successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to revoke device",
        variant: "destructive"
      })
    }
    setShowConfirmRevoke(false)
  }

  const handleTrust = async (device: Device) => {
    try {
      await trustDevice(device.id)
      await refetchDevices()
      toast({
        title: "Success",
        description: "Device has been trusted",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to trust device",
        variant: "destructive"
      })
    }
  }

  const getDeviceIcon = (type: Device['type']) => {
    switch (type) {
      case 'desktop':
        return <Monitor className="h-6 w-6" />
      case 'mobile':
        return <Smartphone className="h-6 w-6" />
      case 'tablet':
        return <TabletSmartphone className="h-6 w-6" />
      default:
        return <Laptop className="h-6 w-6" />
    }
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Device Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {devices?.map((device: Device) => (
              <div
                key={device.id}
                className={`p-4 rounded-lg border ${
                  device.isCurrent ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`${device.trusted ? 'text-green-600' : 'text-gray-600'}`}>
                      {getDeviceIcon(device.type)}
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {device.browser} on {device.os}
                        {device.isCurrent && (
                          <span className="ml-2 text-sm text-blue-600 font-normal">
                            (Current device)
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Last active: {new Date(device.lastActive).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!device.trusted && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTrust(device)}
                      >
                        Trust Device
                      </Button>
                    )}
                    {!device.isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedDevice(device)
                          setShowConfirmRevoke(true)
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Revoke
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={showConfirmRevoke}
        onClose={() => setShowConfirmRevoke(false)}
        onConfirm={() => selectedDevice && handleRevoke(selectedDevice)}
        title="Revoke Device Access"
        message="Are you sure you want to revoke access for this device? This will sign out all sessions on this device."
        confirmText="Revoke Access"
        type="danger"
      />

      <Modal
        isOpen={showDeviceDetails}
        onClose={() => setShowDeviceDetails(false)}
        title="Device Details"
      >
        {selectedDevice && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Browser</h3>
              <p className="text-gray-600">{selectedDevice.browser}</p>
            </div>
            <div>
              <h3 className="font-medium">Operating System</h3>
              <p className="text-gray-600">{selectedDevice.os}</p>
            </div>
            {selectedDevice.location && (
              <div>
                <h3 className="font-medium">Location</h3>
                <p className="text-gray-600">{selectedDevice.location}</p>
              </div>
            )}
            <div>
              <h3 className="font-medium">Status</h3>
              <p className="text-gray-600">
                {selectedDevice.trusted ? 'Trusted Device' : 'Not Trusted'}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}