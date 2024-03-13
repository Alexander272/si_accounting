import { ISIFilter } from '@/features/dataTable/types/data'

export interface IUser {
	id: string
	name: string
	role: string
	menu: string[]
	token: string
	filters: ISIFilter[]
}
