export async function deletePurchase(pmId: string) {
  const response = await fetch(`http://localhost:3333/api/purchases/${pmId}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) throw new Error('Falha ao deletar dívida')
}
