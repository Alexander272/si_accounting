import { FC, MouseEvent, PropsWithChildren, forwardRef, useRef, useState } from 'react'
import { Stack, Tooltip, Typography } from '@mui/material'

import { isOverflown } from '@/features/dataTable/utils/overflow'

type Props = {
	label: string
	width: number
	first?: boolean
	align?: 'right' | 'left' | 'center' | 'justify'
	inCeil?: boolean
	onClick?: () => void
}

export const Cell: FC<Props> = ({ label, width, first, align = 'center', inCeil, onClick }) => {
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

	const Box = inCeil ? RowBox : CeilBox

	return (
		<Box
			width={width}
			first={first}
			ref={cellContainer}
			onEnter={mouseEnterHandler}
			onLeave={mouseLeaveHandler}
			onClick={onClick}
		>
			<Tooltip open={visible} title={label} arrow>
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
		</Box>
	)
}

type BoxProps = {
	width: number
	first?: boolean
	onEnter: (event: MouseEvent<HTMLDivElement>) => void
	onLeave: () => void
	onClick?: () => void
}

const CeilBox = forwardRef<HTMLDivElement, PropsWithChildren<BoxProps>>(
	({ children, width, first, onEnter, onLeave }, ref) => (
		<Stack
			ref={ref}
			onMouseEnter={onEnter}
			onMouseLeave={onLeave}
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
			{children}
		</Stack>
	)
)

const RowBox = forwardRef<HTMLDivElement, PropsWithChildren<BoxProps>>(
	({ children, onEnter, onLeave, onClick }, ref) => (
		<Stack
			ref={ref}
			onMouseEnter={onEnter}
			onMouseLeave={onLeave}
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
			{children}
		</Stack>
	)
)
