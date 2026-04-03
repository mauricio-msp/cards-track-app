import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createMember } from '@/features/member/api'

export function useCreateMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },
    onError: error => {
      console.error('Failed to create member:', error)
      toast.error('Falha ao criar membro. Por favor, tente novamente.')
    },
  })
}
