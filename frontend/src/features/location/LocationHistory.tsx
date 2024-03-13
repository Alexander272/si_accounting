import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'

import { useAppSelector } from '@/hooks/redux'
import { useGetLocationsByInstrumentIdQuery } from '@/components/Forms/LocationForm/locationApiSlice'
import { getActiveItem } from '../dataTable/dataTableSlice'
import { useGetInstrumentByIdQuery } from '@/components/Forms/InstrumentForm/instrumentApiSlice'

export const LocationHistory = () => {
	const active = useAppSelector(getActiveItem)

	const { data: instrument } = useGetInstrumentByIdQuery(active?.id || '', { skip: !active?.id })
	const { data } = useGetLocationsByInstrumentIdQuery(active?.id || '', { skip: !active?.id })

	return (
		<TableContainer>
			<Typography fontSize={'1.2rem'} textAlign={'center'}>
				{instrument?.data.name} ({instrument?.data.factoryNumber})
			</Typography>

			<Table>
				<TableHead>
					<TableRow>
						<TableCell>Дата выдачи</TableCell>
						<TableCell>Дата получения</TableCell>
						<TableCell>Место нахождение</TableCell>
						<TableCell>
							Подтверждение
							<br />
							запрашивалось?
						</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{data?.data.map(d => (
						<TableRow key={d.id}>
							<TableCell>{d.dateOfIssue}</TableCell>
							<TableCell>{d.dateOfReceiving}</TableCell>
							{/* <TableCell>{d.department ? `${d.department} (${d.person})` : ''}</TableCell> */}
							{/* <TableCell>{d.status}</TableCell> */}
							<TableCell>{d.status == 'reserve' && !d.place ? 'Резерв' : d.place}</TableCell>
							<TableCell>{`${d.needConfirmed}`}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	)
}
