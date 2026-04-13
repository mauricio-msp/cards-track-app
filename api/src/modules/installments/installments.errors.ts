export class InstallmentNotFoundError extends Error {
  constructor(message = 'Parcela não encontrada!') {
    super(message)
    this.name = 'InstallmentNotFoundError'
  }
}
