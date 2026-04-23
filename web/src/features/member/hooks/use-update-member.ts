import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateMember } from '@/features/member/api'

export function useUpdateMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateMember,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      queryClient.invalidateQueries({ queryKey: ['members', variables.memberId] })
      toast.success('Membro atualizado com sucesso!')
    },
    onError: error => {
      console.error('Failed to update member:', error)
      toast.error('Falha ao atualizar membro. Por favor, tente novamente.')
    },
  })
}
