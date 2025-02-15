import { CSSProperties, FC, memo, MouseEvent } from 'react'
import { Stack } from '@mui/material'
import dayjs from 'dayjs'

import type { Coordinates } from '@/features/dataTable/hooks/useContextMenu'
import type { IDataItem } from '@/features/dataTable/types/data'
import { DayjsFormat } from '@/constants/dateFormat'
import { useAppSelector } from '@/hooks/redux'
import { getColumns } from '@/features/dataTable/dataTableSlice'
import { Cell } from './Cell'

const RowColors = {
	selected: '#05309b1a',
	overdue: '#ff3f3f',
	deadline: '#ff9393',
	active: '#dce6ff',
	moved: '#eee',
	reverse: '#fff4cb',
}

type Props = {
	style: CSSProperties
	data: IDataItem
	selected: boolean
	itemId?: string
	// onSelect: (item: ISelected, selected: boolean) => void
	onSelect: (item: IDataItem) => void
	positionHandler: (coordinates?: Coordinates, item?: IDataItem, isSelected?: boolean) => void
}

export const Row: FC<Props> = memo(({ style, data, selected, itemId, onSelect, positionHandler }) => {
	const columns = useAppSelector(getColumns)

	// TODO по какой-то причине data бывает undefined
	if (!data) return

	// let status: Status = 'used'
	// switch (data.place) {
	// 	case 'Перемещение':
	// 		status = 'moved'
	// 		break
	// 	case 'Резерв':
	// 		status = 'reserve'
	// 		break
	// }

	const selectHandler = () => {
		// onSelect({ id: data.id, status: data.status }, selected)
		onSelect(data)
	}

	const openHandler = (event: MouseEvent<HTMLTableRowElement>) => {
		event.preventDefault()
		positionHandler({ mouseX: event.clientX + 2, mouseY: event.clientY - 6 }, data, selected)
	}

	//TODO подумать как выделять строки (цвета когда надо сдать, просроченные, то что закреплено за текущим пользователем и тд)

	const getRowColor = () => {
		if (selected) return RowColors['selected']
		if (itemId == data.id) return RowColors['active']

		const overdue = dayjs().isAfter(dayjs(data.nextVerificationDate, DayjsFormat))
		if (overdue) return RowColors['overdue']

		if (data.status == 'moved') return RowColors['moved']

		const deadline = dayjs().add(15, 'd').isAfter(dayjs(data.nextVerificationDate, DayjsFormat))
		if (deadline) return RowColors['deadline']

		if (data.status == 'reserve') return RowColors['reverse']
		// if (data.place == 'Перемещение') return RowColors['moved']
		// if (data.place == 'Резерв') return RowColors['reverse']

		return 'transparent'
	}

	return (
		<Stack
			key={data.id}
			direction={'row'}
			onClick={selectHandler}
			onContextMenu={openHandler}
			style={style}
			sx={{
				backgroundColor: getRowColor(),
				cursor: 'pointer',
				transition: '0.3s all ease-in-out',
				':hover': {
					backgroundColor: '#0000000a',
				},
			}}
		>
			{columns.map((c, i) => {
				if (c.hidden) return
				return <Cell key={data.id + c.id} first={!i} width={c.width} label={data[c.id] || '-'} />
			})}
		</Stack>
	)
})
