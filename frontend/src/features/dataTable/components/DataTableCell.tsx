import { FC, MouseEvent, useRef, useState } from 'react'
import { TableCell, Tooltip, Typography } from '@mui/material'

import { isOverflown } from '../utils/overflow'

type Props = {
	index: number
	label: string
	width: number
}

export const DataTableCell: FC<Props> = ({ index, label, width }) => {
	const cellContainer = useRef<HTMLDivElement | null>(null)
	const cellValue = useRef<HTMLParagraphElement | null>(null)

	const [title, setTitle] = useState('')

	const mouseEnterHandler = (event: MouseEvent<HTMLDivElement>) => {
		cellContainer.current = event.target as HTMLDivElement
		const isCurrentlyOverflown = isOverflown(cellValue.current)

		if (isCurrentlyOverflown) {
			setTitle(cellValue.current?.textContent || '')
		}
	}

	const mouseLeaveHandler = () => {
		setTitle('')
	}

	return (
		<Tooltip title={title} arrow>
			<TableCell
				ref={cellContainer}
				onMouseEnter={mouseEnterHandler}
				onMouseLeave={mouseLeaveHandler}
				align='center'
				sx={{
					minWidth: width,
					maxWidth: width,
					position: 'relative',
					':before': {
						content: index ? `""` : null,
						width: '1px',
						height: '60%',
						background: '#e0e0e0',
						position: 'absolute',
						top: '20%',
						left: -0.5,
					},
				}}
			>
				<Typography
					ref={cellValue}
					sx={{
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
						pointerEvents: 'none',
					}}
				>
					{label}
				</Typography>
			</TableCell>
		</Tooltip>
	)
}
