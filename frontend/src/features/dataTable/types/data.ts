export type IDataItem = {
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
	size?: number
	sort?: ISISort
	filter?: ISIFilter
}

export interface ISISort {
	field: keyof IDataItem
	type: 'DESC' | 'ASC'
}

export type CompareTypes = 'con' | 'start' | 'end' | 'like' | 'in' | 'eq' | 'gte' | 'lte' | 'range'
export interface ISIFilter {
	field: keyof IDataItem
	fieldType: string
	compareType: CompareTypes
	valueStart: string
	valueEnd: string
}
export interface ISIFilterNew {
	field: keyof IDataItem
	fieldType: string
	values: ISIFilterValue[]
}
export interface ISIFilterValue {
	compareType: CompareTypes
	value: string
}

export type Status = 'reserve' | 'used' | 'moved'
export interface ISelected {
	id: string
	status: Status
}
