import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api'

export function useEmailVerification() {
  const resendMutation = useMutation({
    mutationFn: (email: string) => authApi.resendCode({ email }),
  })

  const verifyMutation = useMutation({
    mutationFn: ({ email, code }: { email: string; code: number }) =>
      authApi.verifyEmail({ email, code }),
  })

  return {
    resendCode: resendMutation.mutateAsync,
    verifyEmail: verifyMutation.mutateAsync,
    isResending: resendMutation.isPending,
    isVerifying: verifyMutation.isPending,
  }
}
