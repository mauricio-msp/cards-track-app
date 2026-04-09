export async function deleteDebt(debtId: string) {
  const response = await fetch(`http://localhost:3333/api/debts/${debtId}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) throw new Error('Falha ao deletar dívida')
}
