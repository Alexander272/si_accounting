export type Location = {
	id?: string
	instrumentId: string
	department: string
	person: string
	place?: string
	departmentId?: string
	personId?: string
	dateOfIssue: number
	dateOfReceiving: number
	needConfirmed: boolean
	hasConfirmed?: boolean
	status: string
}

export type Receiving = {
	status: string
	instrumentId: string[]
}
