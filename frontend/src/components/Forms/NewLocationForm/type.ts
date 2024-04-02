export interface ILocationForm {
	id?: string
	department: string
	person: string
	dateOfIssue: number
	needConfirmed: boolean
	isToReserve?: boolean
}

export type KeysOfLocation = 'department' | 'person' | 'dateOfIssue' | 'needConfirmed'

// export type HiddenField = Record<KeysOfLocation, boolean | undefined>

export type HiddenField = {
	department?: boolean
	person?: boolean
	dateOfIssue?: boolean
	needConfirmed?: boolean
	isToReserve?: boolean
}
