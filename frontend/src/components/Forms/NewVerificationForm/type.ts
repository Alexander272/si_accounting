export interface IVerificationForm {
	id?: string
	date: number
	nextDate: number
	// date: Dayjs
	// nextDate: Dayjs
	// fileLink: string
	registerLink: string
	notVerified: boolean
	status: string
	notes: string
}

export type KeysOfVerification = 'date' | 'nextDate' | 'registerLink' | 'status' | 'notes'

export type HiddenField = {
	notVerified?: boolean
}
