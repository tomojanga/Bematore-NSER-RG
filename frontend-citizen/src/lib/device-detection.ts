export const detectDeviceType = () => {
  if (typeof window === 'undefined') return 'unknown'
  
  const ua = navigator.userAgent
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet'
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile'
  }
  return 'desktop'
}

export const detectOS = () => {
  if (typeof window === 'undefined') return 'unknown'
  
  const userAgent = window.navigator.userAgent
  const platform = window.navigator.platform
  const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K']
  const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE']
  const iosPlatforms = ['iPhone', 'iPad', 'iPod']

  if (macosPlatforms.indexOf(platform) !== -1) return 'macOS'
  if (iosPlatforms.indexOf(platform) !== -1) return 'iOS'
  if (windowsPlatforms.indexOf(platform) !== -1) return 'Windows'
  if (/Android/.test(userAgent)) return 'Android'
  if (/Linux/.test(platform)) return 'Linux'

  return 'Unknown'
}

export const detectBrowser = () => {
  if (typeof window === 'undefined') return 'unknown'
  
  const ua = navigator.userAgent
  if (ua.indexOf("Chrome") > -1) return "Chrome"
  if (ua.indexOf("Safari") > -1) return "Safari"
  if (ua.indexOf("Firefox") > -1) return "Firefox"
  if (ua.indexOf("Edge") > -1) return "Edge"
  if (ua.indexOf("MSIE") > -1 || ua.indexOf("Trident/") > -1) return "IE"
  return "Unknown"
}