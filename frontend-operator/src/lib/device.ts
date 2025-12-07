export interface DeviceInfo {
  type: string
  os: string
}

export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return { type: 'unknown', os: 'unknown' }
  }

  const userAgent = navigator.userAgent
  let deviceType = 'desktop'
  let os = 'unknown'

  // Detect device type
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    deviceType = 'mobile'
  } else if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    deviceType = 'tablet'
  }

  // Detect OS
  if (/windows/i.test(userAgent)) {
    os = 'windows'
  } else if (/macos|mac os x/i.test(userAgent)) {
    os = 'macos'
  } else if (/linux/i.test(userAgent)) {
    os = 'linux'
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    os = 'ios'
  } else if (/android/i.test(userAgent)) {
    os = 'android'
  }

  return { type: deviceType, os }
}
