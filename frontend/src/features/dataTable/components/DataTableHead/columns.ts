import { ColumnNames } from '@/constants/columns'
import { IDataItem } from '../../types/data'

const initWidth = 200

export interface IHeadCell {
	id: keyof IDataItem
	label: string
	width: number
	type?: 'string' | 'date' | 'number'
	// sorting?: 'none' | 'DESC' | 'ASC'
}

export const HeadCells: readonly IHeadCell[] = [
	{
		id: 'name',
		label: ColumnNames.NAME,
		width: initWidth,
	},
	{
		id: 'type',
		label: ColumnNames.TYPE,
		width: initWidth,
	},
	{
		id: 'factoryNumber',
		label: ColumnNames.FACTORY_NUMBER,
		width: initWidth,
	},
	{
		id: 'stateRegister',
		label: ColumnNames.STATE_REGISTER,
		width: initWidth,
	},
	{
		id: 'verificationDate',
		label: ColumnNames.VERIFICATION_DATE,
		width: initWidth,
		type: 'date',
	},
	{
		id: 'interVerificationInterval',
		label: ColumnNames.INTER_VERIFICATION_INTERVAL,
		width: initWidth,
		type: 'number',
	},
	{
		id: 'nextVerificationDate',
		label: ColumnNames.NEXT_VERIFICATION_DATE,
		width: initWidth,
		type: 'date',
	},
	{
		id: 'place',
		label: ColumnNames.PLACE,
		width: initWidth,
	},
	{
		id: 'measurementLimits',
		label: ColumnNames.MEASUREMENT_LIMITS,
		width: initWidth,
	},
	{
		id: 'accuracy',
		label: ColumnNames.ACCURACY,
		width: initWidth,
	},
	{
		id: 'manufacturer',
		label: ColumnNames.MANUFACTURER,
		width: initWidth,
	},
	{
		id: 'yearOfIssue',
		label: ColumnNames.YEAR_OF_ISSUE,
		width: initWidth,
		type: 'number',
	},
	{
		id: 'notes',
		label: ColumnNames.NOTES,
		width: initWidth,
	},
]
