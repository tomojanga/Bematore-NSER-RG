import { getDeviceInfo } from '@/lib/device'
import { create } from 'zustand'

interface DeviceState {
  currentDevice: string | null
  setCurrentDevice: (name: string) => void
}

export const useDeviceStore = create<DeviceState>((set) => ({
  currentDevice: typeof window !== 'undefined' ? localStorage.getItem('currentDevice') : null,
  setCurrentDevice: (name) => {
    localStorage.setItem('currentDevice', name)
    set({ currentDevice: name })
  }
}))

// Helper function to identify current device and set name in store
export const identifyDevice = () => {
  const deviceInfo = getDeviceInfo()
  const { currentDevice, setCurrentDevice } = useDeviceStore.getState()
  
  if (!currentDevice) {
    const defaultName = `${deviceInfo.type}-${deviceInfo.os}-${Date.now()}`
    setCurrentDevice(defaultName)
    return defaultName
  }
  
  return currentDevice
}