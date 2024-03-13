import { useRef, type FC, useState, type MouseEvent } from 'react'
import { Stack, Tooltip, Typography, useTheme } from '@mui/material'

import type { ISort } from '../type'
import { isOverflown } from '@/features/dataTable/utils/overflow'
import { SortDownIcon } from '@/components/Icons/SortDownIcon'
import { SortUpIcon } from '@/components/Icons/SortUpIcon'

type Props = {
	id: string
	label: string
	width: number
	first?: boolean
	align?: 'right' | 'left' | 'center' | 'justify'
	sort?: ISort
	onSort?: (field: string) => void
}

export const HeadCell: FC<Props> = ({ id, label, width, first, align = 'center', sort, onSort }) => {
	const { palette } = useTheme()

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

	const setSortHandler = (fieldId: string) => () => {
		onSort && onSort(fieldId)
	}

	return (
		<Stack
			width={width}
			sx={{
				backgroundColor: '#fff',
				padding: 0,
				minWidth: width,
				maxWidth: width,
				borderBottomColor: palette.primary.main,
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
			<Stack
				ref={cellContainer}
				onMouseEnter={mouseEnterHandler}
				onMouseLeave={mouseLeaveHandler}
				onClick={setSortHandler(id)}
				// pr={1}
				sx={{
					minWidth: width,
					maxWidth: width,
					// borderBottom: '1px solid #e0e0e0',
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
						{sort?.field == id && sort?.type == 'ASC' ? (
							<SortUpIcon
								fontSize={16}
								fill={sort?.field === id ? 'black' : '#adadad'}
								marginRight={'6px'}
							/>
						) : null}

						{sort?.field === id && sort?.type == 'DESC' ? (
							<SortDownIcon fontSize={16} fill={'black'} marginRight={'6px'} />
						) : null}

						{label}
					</Typography>
				</Tooltip>
			</Stack>

			{/* <Cell label={label} width={width} first={first} align={align} inCeil onClick={setSortHandler(id)} />

			<Stack direction={'row'} spacing={2} mb={0.5} justifyContent={'center'} alignItems={'center'}>
				<Tooltip title={'Сортировать'} arrow>
					<Button onClick={setSortHandler(id)} sx={{ ml: 1 }}>
						{sort?.field !== id || sort?.type == 'ASC' ? (
							<SortUpIcon fontSize={16} color={sort?.field === id ? 'black' : '#adadad'} />
						) : null}

						{sort?.field === id && sort?.type == 'DESC' ? (
							<SortDownIcon fontSize={16} color={'black'} />
						) : null}
					</Button>
				</Tooltip> */}

			{/* <Filter cell={c} fieldId={c.id} /> */}
			{/* </Stack> */}
		</Stack>
	)
}
