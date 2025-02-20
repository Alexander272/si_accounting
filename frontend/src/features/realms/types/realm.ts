export interface IRealm {
	id: string
	name: string
	realm: string
	isActive: boolean
	reserveChannel: string
	expirationNotice: boolean
	locationType: string
	created: string
}

export interface IRealmDTO {
	id?: string
	name: string
	realm: string
	isActive: boolean
	reserveChannel: string
	expirationNotice: boolean
	locationType: string
}
