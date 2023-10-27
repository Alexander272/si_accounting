import { FC, memo } from 'react'
import { TableRow } from '@mui/material'
import dayjs from 'dayjs'

import { DataTableCell } from './DataTableCell'
import { HeadCells } from './DataTableHead/DataTableHead'
import { IDataItem } from '../types/data'
import { useSingleAndDoubleClick } from '../utils/clicks'

type Props = {
	data: IDataItem
	selected: boolean
	onSelect: (id: string, selected: boolean) => void
}

export const DataTableRow: FC<Props> = memo(({ data, selected, onSelect }) => {
	const deadline = dayjs().add(15, 'd').isAfter(dayjs(data.nextVerificationDate, 'DD.MM.YYYY'))

	const selectHandler = () => {
		onSelect(data.id, selected)
	}

	const openHandler = () => {
		console.log('open')
	}

	const clickHandler = useSingleAndDoubleClick(selectHandler, openHandler)

	return (
		<TableRow
			key={data.id}
			onClick={clickHandler}
			// onClick={selectHandler}
			// onDoubleClick={openHandler(d.id)}
			selected={selected}
			hover
			sx={{ background: deadline ? '#ff9393' : 'transparent', cursor: 'pointer' }}
		>
			{HeadCells.map((c, i) => (
				<DataTableCell key={data.id + c.id} index={i} width={c.width} label={data[c.id] || '-'} />
			))}
		</TableRow>
	)
})
