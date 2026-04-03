export async function deleteDebt(debtId: string) {
  await fetch(`http://localhost:3333/api/debts/${debtId}`, {
    method: 'DELETE',
    credentials: 'include',
  })
}
