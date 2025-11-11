import { AxiosError } from 'axios'

export interface RetryConfig {
  maxRetries: number
  retryDelay: number
  retryableStatuses: number[]
}

const defaultConfig: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatuses: [408, 429, 500, 502, 503, 504]
}

export function shouldRetry(error: AxiosError, config: RetryConfig = defaultConfig): boolean {
  if (!error.response) return true // Network errors
  return config.retryableStatuses.includes(error.response.status)
}

export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function getRetryDelay(attempt: number, baseDelay: number = 1000): number {
  return Math.min(baseDelay * Math.pow(2, attempt), 10000) + Math.random() * 1000
}
