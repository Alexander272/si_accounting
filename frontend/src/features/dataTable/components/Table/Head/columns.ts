import { FC } from 'react'

import type { IDataItem } from '@/features/dataTable/types/data'
import { ColumnNames } from '@/constants/columns'
import { PersonFilter } from '../../Filter/PersonFilter'
import { PlaceFilter } from '../../Filter/PlaceFilter'

export const initWidth = 200

export type FilterType = 'string' | 'date' | 'number' | 'list'
export interface IFullFilter {
	type: FilterType
	options?: unknown
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	getOptions?: (arg: any) => any
}

export interface IHeadCell {
	id: keyof IDataItem
	label: string
	width: number
	type?: FilterType | IFullFilter
	filterComponent?: FC<unknown>
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
		width: initWidth + 50,
		// type: 'list',
		filterComponent: PlaceFilter,
	},
	{
		id: 'person',
		label: ColumnNames.PERSON,
		width: initWidth,
		filterComponent: PersonFilter,
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
