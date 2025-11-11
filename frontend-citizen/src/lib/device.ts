import { detectDeviceType, detectOS, detectBrowser } from '@/lib/device-detection'

export type Device = {
  type: string 
  os: string
  browser: string
  name: string | null
  trusted?: boolean
  lastUsed?: Date | null
}

export type DeviceInfo = Omit<Device, 'trusted' | 'lastUsed'>

export const getDeviceInfo = (): DeviceInfo => {
  return {
    type: detectDeviceType(),
    os: detectOS(),
    browser: detectBrowser(),
    name: null // User can set this later
  }
}