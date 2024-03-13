import { FC, MouseEvent, useRef, useState } from 'react'
import { Stack, Tooltip, Typography } from '@mui/material'

import { isOverflown } from '../../utils/overflow'

type Props = {
	// fieldId: string
	label: string
	onClick: () => void
}

export const HeadCell: FC<Props> = ({ label, onClick }) => {
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

	return (
		<Tooltip open={visible} title={label} arrow>
			<Stack
				ref={cellContainer}
				onMouseEnter={mouseEnterHandler}
				onMouseLeave={mouseLeaveHandler}
				onClick={onClick}
				direction={'row'}
				justifyContent={'center'}
				alignItems={'center'}
				width={'100%'}
				borderRadius={3}
				padding={'6px 16px'}
				pr={'4px'}
				sx={{
					cursor: 'pointer',
					position: 'relative',
					transition: 'all 0.3s ease-in-out',
					':hover': { backgroundColor: '#0000000a' },
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
			</Stack>
		</Tooltip>
	)
}
