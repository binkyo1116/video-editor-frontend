import {ID, Response} from '../../../../../../_metronic/helpers'
export type User = {
  _id?: ID
  fullname?: string
  avatar?: string
  email?: string
  role?: string
  isAdmin?: boolean
  last_login?: string
  isActive?: boolean
  two_steps?: boolean
  password?: string
  password_confirmation?: string
  joined_day?: string
  online?: boolean
  initials?: {
    label: string
    state: string
  }
}

export type UsersQueryResponse = Response<Array<User>>

export const initialUser: User = {
  avatar: 'avatars/300-6.jpg',
  role: 'Administrator',
  fullname: '',
  email: '',
  password: '',
}
