import { create } from 'zustand'
export interface UserData {
  objectId: string,
  name: string,
  description: string,
  sex: string,
  avatar: string,
}
interface UserState {
  userData: UserData
  setUser: (userData: UserData) => void
}

export const useUserStore = create<UserState>()((set) => ({
  userData: {
    objectId: '',
    name: '',
    description: '',
    sex: '',
    avatar: '',
  },
  setUser: (userData: UserData) => set({
    userData: {
      objectId: userData.objectId,
      name: userData.name,
      description: userData.description,
      sex: userData.sex,
      avatar: userData.avatar,
    },
  }),
}))
