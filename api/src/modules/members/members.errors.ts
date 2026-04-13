export class MemberNotFoundError extends Error {
  constructor() {
    super('Membro não encontrado')
    this.name = 'MemberNotFoundError'
  }
}

export class MemberAlreadyExistsError extends Error {
  constructor() {
    super('Membro já existe para este usuário')
    this.name = 'MemberAlreadyExistsError'
  }
}
