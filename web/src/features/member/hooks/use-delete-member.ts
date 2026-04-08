import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteMember } from '@/features/member/api'

export function useDeleteMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },
    onError: error => {
      console.error('Failed to delete member:', error)
      toast.error('Falha ao excluir membro. Por favor, tente novamente.')
    },
  })
}
