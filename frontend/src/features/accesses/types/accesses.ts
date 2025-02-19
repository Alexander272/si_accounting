import { IRole } from '@/features/user/types/role'
import { IUserData } from '@/features/user/types/user'

export interface IAccesses {
	id: string
	realmId: string
	user: IUserData
	role: IRole
}

export interface IAccessesDTO {
	id?: string
	realmId: string
	userId: string
	roleId: string
}
