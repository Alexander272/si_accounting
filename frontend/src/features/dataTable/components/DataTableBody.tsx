import { TableBody, TableRow } from '@mui/material'

import { useAppSelector } from '@/hooks/redux'
import { HeadCells } from './DataTableHead/DataTableHead'
import { useGetAllSIQuery } from '../siApiSlice'
import { DataTableCell } from './DataTableCell'
import { getTableSort } from '../dataTableSlice'

export const DataTableBody = () => {
	const sort = useAppSelector(getTableSort)

	const { data } = useGetAllSIQuery({ sort: sort || undefined })

	return (
		<TableBody>
			{data?.data.map(d => (
				<TableRow key={d.id}>
					{HeadCells.map((c, i) => (
						<DataTableCell key={d.id + c.id} index={i} width={c.width} label={d[c.id] || '-'} />
						// <TableCell
						// 	key={d.id + c.id}
						// 	align='center'
						// 	sx={{
						// 		position: 'relative',
						// 		':before': {
						// 			content: i ? `""` : null,
						// 			width: '1px',
						// 			height: '60%',
						// 			background: '#e0e0e0',
						// 			position: 'absolute',
						// 			top: '20%',
						// 			left: -0.5,
						// 		},
						// 	}}
						// >
						// 	{d[c.id] || '-'}
						// </TableCell>
					))}
				</TableRow>
			))}
		</TableBody>
	)
}
