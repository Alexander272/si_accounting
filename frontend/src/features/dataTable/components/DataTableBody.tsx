import { TableBody, TableCell, TableRow } from '@mui/material'
import { IDataItem } from '../types/data'
import { HeadCells } from './DataTableHead'

const data: IDataItem[] = [
	{
		id: '1',
		name: 'test',
		type: '',
		factoryNumber: '',
		measurementLimits: '',
		manufacturer: '',
		accuracy: '',
		yearOfIssue: '',
		verificationDate: '',
		interVerificationInterval: '12',
		nextVerificationDate: '',
		place: '',
		notes: '',
	},
]

export const DataTableBody = () => {
	return (
		<TableBody>
			{data.map(d => (
				<TableRow key={d.id}>
					{HeadCells.map((c, i) => (
						<TableCell
							key={d.id + c.id}
							align='center'
							sx={{
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
							{d[c.id] || '-'}
						</TableCell>
					))}
				</TableRow>
			))}
		</TableBody>
	)
}
