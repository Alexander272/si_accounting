import { ColumnNames } from '@/constants/columns'
import { RegisterOptions } from 'react-hook-form'

export interface IField<T> {
	key: T
	label: string
	type?: 'string' | 'date' | 'year' | 'number' | 'file' | 'link'
	rules?: RegisterOptions
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

export type InstrumentFormType = {
	[item in KeysOfInstrument]: string
}

export const InstrumentFields: IField<KeysOfInstrument>[] = [
	{ key: 'name', label: ColumnNames.NAME, rules: { required: true } },
	{ key: 'type', label: ColumnNames.TYPE },
	{ key: 'factoryNumber', label: ColumnNames.FACTORY_NUMBER },
	{ key: 'measurementLimits', label: ColumnNames.MEASUREMENT_LIMITS },
	{ key: 'accuracy', label: ColumnNames.ACCURACY },
	{ key: 'stateRegister', label: ColumnNames.STATE_REGISTER },
	{ key: 'manufacturer', label: ColumnNames.MANUFACTURER },
	{ key: 'yearOfIssue', label: ColumnNames.YEAR_OF_ISSUE, type: 'number', rules: { required: true } },
	{
		key: 'interVerificationInterval',
		label: ColumnNames.INTER_VERIFICATION_INTERVAL,
		type: 'number',
		rules: { required: true, min: 1 },
	},
	{ key: 'notes', label: ColumnNames.NOTES },
]

export type KeysOfVerification =
	| 'verificationDate'
	| 'nextVerificationDate'
	| 'verificationFile'
	| 'verificationLink'
	| 'verificationStatus'

export type VerificationFormType = {
	[item in KeysOfVerification]: string
}

export const VerificationFields: IField<KeysOfVerification>[] = [
	{ key: 'verificationDate', label: ColumnNames.VERIFICATION_DATE, type: 'date' },
	{ key: 'nextVerificationDate', label: ColumnNames.NEXT_VERIFICATION_DATE, type: 'date' },
	{ key: 'verificationFile', label: 'Файл', type: 'file' },
	{ key: 'verificationLink', label: 'Ссылка о поверке', type: 'link' },
	{ key: 'verificationStatus', label: 'Результат поверки' },
]
