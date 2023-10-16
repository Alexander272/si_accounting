import { TableCell, TableHead, TableRow } from '@mui/material'

import { ColumnNames } from '@/constants/columns'
import { IDataItem } from '../types/data'

interface HeadCell {
	id: keyof IDataItem
	label: string
	width: number
	// sorting?: 'none' | 'DESC' | 'ASC'
}

const initWidth = 200

export const HeadCells: readonly HeadCell[] = [
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
	return (
		<TableHead>
			{/* <TableRow sx={{ display: 'inline-block', paddingY: 0.5 }}> */}
			<TableRow>
				{HeadCells.map((c, i) => (
					<TableCell
						key={c.id}
						width={c.width}
						align='center'
						sx={{
							// borderLeft: '1px solid #e0e0e0',
							// transition: 'all 0.3s ease-in-out',
							cursor: 'pointer',
							// borderRadius: 2,
							// ':hover': { backgroundColor: '#0000000a' },
							// ':first-of-type': { borderLeft: 'none' },
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
						{c.label}

						{/* //TODO иконка для сортировки */}

						{/* //TODO иконка фильтра */}
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	)
}
