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
	lastPlace: string
	person: string
	notes: string
	status: Status
}

export type SIStatus = 'work' | 'repair' | 'decommissioning'
export interface ISIParams {
	status?: SIStatus
	page?: number
	size?: number
	all?: boolean
	sort?: ISISortObj
	filter?: ISIFilter[]
}

//TODO пишут что map лучше не использовать в state
export type ISISortMap = Map<keyof IDataItem, 'DESC' | 'ASC'>
export type ISISortObj = {
	[K in keyof IDataItem]?: 'DESC' | 'ASC'
}

export interface ISISort {
	field: keyof IDataItem
	type: 'DESC' | 'ASC'
}

export type CompareTypes = 'con' | 'start' | 'end' | 'like' | 'in' | 'eq' | 'gte' | 'lte' | 'range' | 'null'
export interface ISIFilterOld {
	field: keyof IDataItem
	fieldType: string
	compareType: CompareTypes
	valueStart: string
	valueEnd: string
}
export interface ISIFilter {
	field: keyof IDataItem
	fieldType?: string
	values: ISIFilterValue[]
}
export interface ISIFilterValue {
	compareType: CompareTypes
	value: string
}
export interface ISIFilterForm {
	field: keyof IDataItem
	fieldType: string
	compareType: CompareTypes
	valueStart: string
	valueEnd: string
}

export type Status = 'reserve' | 'used' | 'moved'
export interface ISelected {
	id: string
	status: Status
}
