import { FC, MouseEvent, useRef, useState } from 'react'
import { Stack, Tooltip, Typography } from '@mui/material'

const isOverflown = (element: Element | null) => {
	if (!element) {
		return false
	}
	return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth
}

type Props = {
	// fieldId: string
	label: string
	onClick: () => void
}

export const HeadCell: FC<Props> = ({ label, onClick }) => {
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
			<Stack
				ref={cellContainer}
				onMouseEnter={mouseEnterHandler}
				onMouseLeave={mouseLeaveHandler}
				onClick={onClick}
				direction={'row'}
				// spacing={1}
				justifyContent={'center'}
				alignItems={'center'}
				width={'100%'}
				borderRadius={3}
				padding={'6px 16px'}
				pr={'4px'}
				sx={{
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
