import { FC, MouseEvent, useRef, useState } from 'react'
import { Stack, Tooltip, Typography } from '@mui/material'

import { isOverflown } from '@/features/dataTable/utils/overflow'

type Props = {
	label: string
	width: number
	first?: boolean
	align?: 'right' | 'left' | 'center' | 'justify'
}

export const Cell: FC<Props> = ({ label, width, first, align = 'center' }) => {
	const cellContainer = useRef<HTMLDivElement | null>(null)
	const cellValue = useRef<HTMLParagraphElement | null>(null)

	const [visible, setVisible] = useState(false)

	const mouseEnterHandler = (event: MouseEvent<HTMLDivElement>) => {
		cellContainer.current = event.target as HTMLDivElement
		const isCurrentlyOverflown = isOverflown(cellValue.current)

		if (isCurrentlyOverflown) {
			setVisible(true)
		}
	}

	const mouseLeaveHandler = () => {
		setVisible(false)
	}

	//TODO можно еще предусмотреть форматирование. либо сделать форматирование для типов, либо в список колонок добавить функцию которая будет преобразовывать
	return (
		<Stack
			ref={cellContainer}
			onMouseEnter={mouseEnterHandler}
			onMouseLeave={mouseLeaveHandler}
			// pr={1}
			sx={{
				minWidth: width,
				maxWidth: width,
				borderBottom: '1px solid #e0e0e0',
				position: 'relative',
				':before': {
					content: !first ? '""' : null,
					width: '1px',
					height: '60%',
					background: '#e0e0e0',
					position: 'absolute',
					top: '20%',
					left: -0.5,
				},
			}}
		>
			<Tooltip open={visible} title={label} arrow disableInteractive>
				<Typography
					ref={cellValue}
					align={align}
					padding={'6px 14px'}
					sx={{
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
						pointerEvents: 'none',
					}}
				>
					{label}
				</Typography>
			</Tooltip>
		</Stack>
	)
}
