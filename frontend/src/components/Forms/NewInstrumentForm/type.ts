export interface IInstrumentForm {
	id?: string
	name: string
	type: string
	factoryNumber: string
	measurementLimits: string
	accuracy: string
	stateRegister: string
	manufacturer: string
	yearOfIssue: string
	interVerificationInterval: string
	notes: string
}

export type KeysOfInstrument =
	| 'name'
	| 'type'
	| 'factoryNumber'
	| 'measurementLimits'
	| 'accuracy'
	| 'stateRegister'
	| 'manufacturer'
	| 'yearOfIssue'
	| 'interVerificationInterval'
	| 'notes'
