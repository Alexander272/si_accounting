import { FC, memo, MouseEvent } from 'react'
import { TableRow } from '@mui/material'
import dayjs from 'dayjs'

import type { Coordinates } from '../hooks/useContextMenu'
import type { IDataItem, ISelected, Status } from '../types/data'
import { DayjsFormat } from '@/constants/dateFormat'
import { DataTableCell } from './DataTableCell'
import { HeadCells } from './DataTableHead/columns'

const RowColors = {
	overdue: '#ff3f3f',
	deadline: '#ff9393',
	active: '#dce6ff',
	moved: '#eee',
	reverse: '#fff4cb',
}

type Props = {
	data: IDataItem
	selected: boolean
	itemId?: string
	onSelect: (item: ISelected, selected: boolean) => void
	positionHandler: (coordinates?: Coordinates, itemId?: string, status?: Status, isSelected?: boolean) => void
}

export const DataTableRow: FC<Props> = memo(({ data, selected, itemId, onSelect, positionHandler }) => {
	let status: Status = 'used'
	switch (data.place) {
		case 'Перемещение':
			status = 'moved'
			break
		case 'Резерв':
			status = 'reserve'
			break
	}

	const selectHandler = () => {
		onSelect({ id: data.id, status: status }, selected)
	}

	const openHandler = (event: MouseEvent<HTMLTableRowElement>) => {
		event.preventDefault()
		positionHandler({ mouseX: event.clientX + 2, mouseY: event.clientY - 6 }, data.id, status, selected)
	}

	//TODO подумать как выделять строки (цвета когда надо сдать, просроченные, то что закреплено за текущим пользователем и тд)

	const getRowColor = () => {
		if (itemId == data.id) return RowColors['active']

		const overdue = dayjs().isAfter(dayjs(data.nextVerificationDate, DayjsFormat))
		if (overdue) return RowColors['overdue']

		const deadline = dayjs().add(15, 'd').isAfter(dayjs(data.nextVerificationDate, DayjsFormat))
		if (deadline) return RowColors['deadline']

		if (data.place == 'Перемещение') return RowColors['moved']
		if (data.place == 'Резерв') return RowColors['reverse']

		return 'transparent'
	}

	return (
		<TableRow
			key={data.id}
			onClick={selectHandler}
			onContextMenu={openHandler}
			selected={selected}
			hover
			sx={{
				backgroundColor: getRowColor(),
				cursor: 'pointer',
				transition: '0.3s all ease-in-out',
			}}
		>
			{HeadCells.map((c, i) => (
				<DataTableCell key={data.id + c.id} index={i} width={c.width} label={data[c.id] || '-'} />
			))}
		</TableRow>
	)
})
