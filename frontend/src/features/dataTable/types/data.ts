export interface IDataItem {
	id: string
	name: string
	type: string
	factoryNumber: string
	measurementLimits: string
	manufacturer: string
	accuracy: string
	stateRegister: string
	yearOfIssue: string
	verificationDate: string
	interVerificationInterval: string
	nextVerificationDate: string
	place: string
	notes: string
}

export interface ISIParams {
	page?: number
	limit?: number
	sort?: ISISort
	filter?: ISIFilter
}

export interface ISISort {
	field: keyof IDataItem
	type: 'DESC' | 'ASC'
}

export interface ISIFilter {
	field: keyof IDataItem
	compareType: string
	valueStart: string
	valueEnd: string
}
