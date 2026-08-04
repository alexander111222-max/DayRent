import { apiClient } from '@/api/client'
import type {
  AuthStatus,
  LogoutResponse,
  RegisterResponse,
  ResendCodeRequest,
  ResendCodeResponse,
  UserLoginRequest,
  UserRegisterRequest,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from '@/types'

export const authApi = {
  register: (data: UserRegisterRequest) =>
    apiClient.post<RegisterResponse>('/auth/register', data).then((r) => r.data),

  login: (data: UserLoginRequest) =>
    apiClient.post<AuthStatus>('/auth/login', data).then((r) => r.data),

  logout: () => apiClient.post<LogoutResponse>('/auth/logout').then((r) => r.data),

  refresh: () => apiClient.post<AuthStatus>('/auth/refresh').then((r) => r.data),

  resendCode: (data: ResendCodeRequest) =>
    apiClient.post<ResendCodeResponse>('/auth/resend_code', data).then((r) => r.data),

  verifyEmail: (data: VerifyEmailRequest) =>
    apiClient.post<VerifyEmailResponse>('/auth/verify_email', data).then((r) => r.data),
}
