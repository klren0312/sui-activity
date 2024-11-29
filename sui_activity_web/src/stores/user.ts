import { create } from 'zustand'
export interface UserData {
  objectId: string,
  name: string,
  nickname: string,
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
    nickname: '',
    description: '',
    sex: '',
    avatar: '',
  },
  setUser: (userData: UserData) => set({
    userData: {
      objectId: userData.objectId,
      name: userData.name,
      nickname: userData.nickname,
      description: userData.description,
      sex: userData.sex,
      avatar: userData.avatar,
    },
  }),
}))
