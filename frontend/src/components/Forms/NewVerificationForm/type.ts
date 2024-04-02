export interface IVerificationForm {
	id?: string
	date: number
	nextDate: number
	// date: Dayjs
	// nextDate: Dayjs
	// fileLink: string
	registerLink: string
	status: string
	notes: string
}

export type KeysOfVerification = 'date' | 'nextDate' | 'registerLink' | 'status' | 'notes'
