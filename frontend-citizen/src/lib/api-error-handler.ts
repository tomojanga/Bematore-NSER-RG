import { AxiosError } from 'axios'

export interface ApiErrorResponse {
  message: string
  errors?: Record<string, string[]>
  code?: string
  status?: number
}

export class ApiError extends Error {
  public status: number
  public code?: string
  public errors?: Record<string, string[]>

  constructor(message: string, status: number, code?: string, errors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.errors = errors
  }
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (error instanceof AxiosError) {
    const status = error.response?.status || 500
    const data = error.response?.data as ApiErrorResponse | undefined
    
    return new ApiError(
      data?.message || error.message || 'An unexpected error occurred',
      status,
      data?.code,
      data?.errors
    )
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 500)
  }

  return new ApiError('An unexpected error occurred', 500)
}

export function getErrorMessage(error: unknown): string {
  const apiError = handleApiError(error)
  
  if (apiError.errors) {
    const firstError = Object.values(apiError.errors)[0]
    return Array.isArray(firstError) ? firstError[0] : apiError.message
  }
  
  return apiError.message
}
