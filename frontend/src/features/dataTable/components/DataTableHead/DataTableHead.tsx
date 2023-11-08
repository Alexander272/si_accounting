import { IconButton, Stack, TableCell, TableHead, TableRow, Tooltip, useTheme } from '@mui/material'

import { ColumnNames } from '@/constants/columns'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { SortUpIcon } from '@/components/Icons/SortUpIcon'
import { SortDownIcon } from '@/components/Icons/SortDownIcon'
import type { IDataItem } from '../../types/data'
import { getTableSort, setSort } from '../../dataTableSlice'
import { Filter } from '../Filter/Filter'
import { HeadCell } from './HeadCell'

export interface IHeadCell {
	id: keyof IDataItem
	label: string
	width: number
	type?: 'string' | 'date' | 'number'
	// sorting?: 'none' | 'DESC' | 'ASC'
}

const initWidth = 200

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

export const DataTableHead = () => {
	const tableSort = useAppSelector(getTableSort)

	const dispatch = useAppDispatch()

	const { palette } = useTheme()

	const setSortHandler = (fieldId: keyof IDataItem) => () => {
		dispatch(setSort(fieldId))
	}

	return (
		<TableHead>
			<TableRow>
				{HeadCells.map((c, i) => (
					<TableCell
						key={c.id}
						width={c.width}
						align='center'
						sx={{
							backgroundColor: '#fff',
							padding: 0,
							minWidth: c.width,
							maxWidth: c.width,
							borderBottomColor: palette.primary.main,
							':before': {
								content: i ? `""` : null,
								width: '1px',
								height: '60%',
								background: '#e0e0e0',
								position: 'absolute',
								top: '20%',
								left: -0.5,
							},
						}}
					>
						<HeadCell label={c.label} onClick={setSortHandler(c.id)} />

						<Stack direction={'row'} spacing={2} mb={0.5} justifyContent={'center'} alignItems={'center'}>
							<Tooltip title={'Сортировать'} arrow>
								<IconButton onClick={setSortHandler(c.id)} sx={{ ml: 1 }}>
									{tableSort?.field !== c.id || tableSort?.type == 'ASC' ? (
										<SortUpIcon
											fontSize={16}
											color={tableSort?.field === c.id ? 'black' : '#adadad'}
										/>
									) : null}

									{tableSort?.field === c.id && tableSort?.type == 'DESC' ? (
										<SortDownIcon
											fontSize={16}
											color={tableSort?.field === c.id ? 'black' : '#adadad'}
										/>
									) : null}
								</IconButton>
							</Tooltip>

							<Filter cell={c} fieldId={c.id} />
						</Stack>
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	)
}
