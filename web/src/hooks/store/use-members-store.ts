import { create } from 'zustand'
import type { Member } from '@/features/member/api/get-members'

interface MembersStore {
  members: Member[]
  setMembers: (members: Member[]) => void
}

export const useMembersStore = create<MembersStore>(set => ({
  members: [],
  setMembers: members => set({ members }),
}))
