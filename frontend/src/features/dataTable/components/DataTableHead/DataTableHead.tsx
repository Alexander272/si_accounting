import { IconButton, Stack, SvgIcon, TableCell, TableHead, TableRow, Tooltip } from '@mui/material'

import { ColumnNames } from '@/constants/columns'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { IDataItem } from '../../types/data'
import { getTableSort, setSort } from '../../dataTableSlice'
import { HeadCell } from './HeadCell'
import { Filter } from './Filter'

export interface IHeadCell {
	id: keyof IDataItem
	label: string
	width: number
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
		id: 'stateRegister',
		label: ColumnNames.STATE_REGISTER,
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
	},
	{
		id: 'verificationDate',
		label: ColumnNames.VERIFICATION_DATE,
		width: initWidth,
	},
	{
		id: 'interVerificationInterval',
		label: ColumnNames.INTER_VERIFICATION_INTERVAL,
		width: initWidth,
	},
	{
		id: 'nextVerificationDate',
		label: ColumnNames.NEXT_VERIFICATION_DATE,
		width: initWidth,
	},
	{
		id: 'place',
		label: ColumnNames.PLACE,
		width: initWidth,
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

	const setSortHandler = (fieldId: keyof IDataItem) => () => {
		dispatch(setSort(fieldId))
	}

	return (
		<TableHead>
			<TableRow>
				{HeadCells.map((c, i) => (
					<TableCell
						key={c.id}
						// onClick={setSortHandler(c.id)}
						width={c.width}
						align='center'
						sx={{
							backgroundColor: '#fff',
							cursor: 'pointer',
							padding: 0,
							minWidth: c.width,
							maxWidth: c.width,
							position: 'relative',
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
									<SvgIcon
										sx={{
											fontSize: '16px',
											fill: tableSort.fieldId === c.id ? 'black' : '#adadad',
										}}
									>
										{tableSort.fieldId !== c.id || tableSort.type == 'DESC' ? (
											<svg
												shapeRendering='geometricPrecision'
												textRendering='geometricPrecision'
												imageRendering='optimizeQuality'
												fillRule='evenodd'
												clipRule='evenodd'
												viewBox='0 0 512 421.65'
											>
												<path
													fillRule='nonzero'
													d='M383.01 379.71c11.57 0 20.97 9.4 20.97 20.97 0 11.57-9.4 20.97-20.97 20.97l-362.04-.44C9.4 421.21 0 411.81 0 400.24c0-11.57 9.4-20.97 20.97-20.97l362.04.44zm-90.97-238.93c-7.91 7.94-20.8 7.99-28.74.08-7.94-7.91-7.99-20.8-.08-28.74L369.33 5.98c7.91-7.94 20.79-7.99 28.73-.08l107.98 107.91c7.95 7.94 7.95 20.87 0 28.81-7.94 7.95-20.87 7.95-28.81 0l-73.12-73.11.32 206.4c0 11.2-9.1 20.3-20.3 20.3-11.2 0-20.29-9.1-20.29-20.3l-.32-206.63-71.48 71.5zM171.62 40.59c11.57 0 20.97 9.41 20.97 20.98 0 11.56-9.4 20.97-20.97 20.97l-150.65-.16C9.4 82.38 0 72.97 0 61.4c0-11.56 9.4-20.97 20.97-20.97l150.65.16zm41.33 170.71c11.57 0 20.97 9.4 20.97 20.97 0 11.57-9.4 20.97-20.97 20.97l-191.98-.23C9.4 253.01 0 243.61 0 232.04c0-11.56 9.4-20.97 20.97-20.97l191.98.23z'
												/>
											</svg>
										) : null}
										{tableSort.fieldId === c.id && tableSort.type == 'ASC' ? (
											<svg
												shapeRendering='geometricPrecision'
												textRendering='geometricPrecision'
												imageRendering='optimizeQuality'
												fillRule='evenodd'
												clipRule='evenodd'
												viewBox='0 0 512 421.65'
											>
												<path
													fillRule='nonzero'
													d='M383.01 0c11.57 0 20.97 9.4 20.97 20.97 0 11.57-9.4 20.97-20.97 20.97l-362.04.44C9.4 42.38 0 32.97 0 21.4 0 9.84 9.4.43 20.97.43L383.01 0zM263.22 309.53c-7.91-7.95-7.86-20.83.08-28.74s20.83-7.86 28.74.08l71.48 71.5.32-206.63c0-11.2 9.09-20.3 20.29-20.3s20.3 9.1 20.3 20.3l-.32 206.4 73.12-73.12c7.94-7.94 20.87-7.94 28.81 0 7.95 7.95 7.95 20.88 0 28.82l-107.9 107.9c-8.02 7.91-20.9 7.87-28.81-.08L263.22 309.53zm-91.6 29.58c11.57 0 20.97 9.4 20.97 20.97 0 11.57-9.4 20.97-20.97 20.97l-150.65.16C9.4 381.21 0 371.81 0 360.24c0-11.56 9.4-20.97 20.97-20.97l150.65-.16zm41.33-170.7c11.57 0 20.97 9.4 20.97 20.97 0 11.57-9.4 20.97-20.97 20.97l-191.98.23C9.4 210.58 0 201.17 0 189.6c0-11.56 9.4-20.97 20.97-20.97l191.98-.22z'
												/>
											</svg>
										) : null}
									</SvgIcon>
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
