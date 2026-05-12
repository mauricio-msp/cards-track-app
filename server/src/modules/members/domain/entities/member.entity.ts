export class MemberEntity {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly relationship: string,
    readonly phone: string | null,
  ) {}
}
