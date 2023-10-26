import { TableBody, TableRow } from '@mui/material'

import { useAppSelector } from '@/hooks/redux'
import { HeadCells } from './DataTableHead/DataTableHead'
import { useGetAllSIQuery } from '../siApiSlice'
import { DataTableCell } from './DataTableCell'
import { getTableFilter, getTableSort } from '../dataTableSlice'
import dayjs from 'dayjs'

export const DataTableBody = () => {
	const sort = useAppSelector(getTableSort)
	const filter = useAppSelector(getTableFilter)

	const { data } = useGetAllSIQuery({ sort: sort, filter })

	return (
		<TableBody>
			{data?.data.map(d => {
				const deadline = dayjs().add(15, 'd').isAfter(dayjs(d.nextVerificationDate, 'DD.MM.YYYY'))

				return (
					<TableRow key={d.id} sx={{ background: deadline ? '#ff9393' : 'transparent' }}>
						{HeadCells.map((c, i) => (
							<DataTableCell key={d.id + c.id} index={i} width={c.width} label={d[c.id] || '-'} />
						))}
					</TableRow>
				)
			})}
		</TableBody>
	)
}
