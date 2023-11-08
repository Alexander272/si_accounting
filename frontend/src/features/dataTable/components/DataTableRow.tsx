import { FC, memo, MouseEvent } from 'react'
import { TableRow } from '@mui/material'
import dayjs from 'dayjs'

import { DataTableCell } from './DataTableCell'
import { HeadCells } from './DataTableHead/DataTableHead'
import { IDataItem } from '../types/data'
// import { useContextMenu } from '../hooks/useContextMenu'
// import { useSingleAndDoubleClick } from '../utils/clicks'

type Props = {
	data: IDataItem
	selected: boolean
	onSelect: (id: string, selected: boolean) => void
}

export const DataTableRow: FC<Props> = memo(({ data, selected, onSelect }) => {
	// const { positionHandler } = useContextMenu()

	const deadline = dayjs().add(15, 'd').isAfter(dayjs(data.nextVerificationDate, 'DD.MM.YYYY'))

	const selectHandler = () => {
		onSelect(data.id, selected)
	}

	const openHandler = (event: MouseEvent<HTMLTableRowElement>) => {
		event.preventDefault()
		console.log('open')
		// positionHandler({ mouseX: event.clientX + 2, mouseY: event.clientY - 6 }, data.id, selected)
	}

	// const clickHandler = useSingleAndDoubleClick(selectHandler, openHandler)

	return (
		<TableRow
			key={data.id}
			// onClick={clickHandler}
			onClick={selectHandler}
			onContextMenu={openHandler}
			// onDoubleClick={openHandler(d.id)}
			selected={selected}
			hover
			sx={{
				backgroundColor: deadline ? '#ff9393' : 'transparent',
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
