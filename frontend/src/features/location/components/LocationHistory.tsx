import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import dayjs from 'dayjs'

import { useAppSelector } from '@/hooks/redux'
import { DayjsFormat } from '@/constants/dateFormat'
import { useGetInstrumentByIdQuery } from '@/features/instrument/instrumentApiSlice'
import { getActiveItem } from '../../dataTable/dataTableSlice'
import { useGetLocationsByInstrumentIdQuery } from '../locationApiSlice'

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
						<TableCell align='center'>Дата выдачи</TableCell>
						<TableCell align='center'>Дата получения</TableCell>
						<TableCell align='center'>Место нахождение</TableCell>
						<TableCell align='center'>
							Подтверждение
							<br />
							запрашивалось?
						</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{data?.data.map(d => (
						<TableRow key={d.id}>
							<TableCell align='center'>{dayjs(d.dateOfIssue * 1000).format(DayjsFormat)}</TableCell>
							<TableCell align='center'>
								{d.dateOfReceiving != 0 ? dayjs(d.dateOfReceiving * 1000).format(DayjsFormat) : '-'}
							</TableCell>
							{/* <TableCell>{d.department ? `${d.department} (${d.person})` : ''}</TableCell> */}
							{/* <TableCell>{d.status}</TableCell> */}
							<TableCell align='center'>
								{d.status == 'reserve' && !d.place ? 'Резерв' : d.place}
							</TableCell>
							<TableCell align='center'>{d.needConfirmed ? 'Да' : 'Нет'}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	)
}
