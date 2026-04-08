export async function deleteMember(memberId: string) {
  const response = await fetch(`http://localhost:3333/api/members/${memberId}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) throw new Error('Falha ao deletar membro por ID.')
}
