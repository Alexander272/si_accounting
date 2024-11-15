// import { FC } from 'react'
// import { TableBody, TableRow } from '@mui/material'
// import { useVirtualizer } from '@tanstack/react-virtual'

// import type { Column } from '../type'
// import { RowHeight, Size } from '@/constants/defaultValues'
// import { Cell } from '../Cell/Cell'

// type Props = {
// 	containerRef: HTMLElement | null
// 	columns: readonly Column[]
// 	data: Record<string, string>[]
// 	height?: number
// 	itemSize?: number
// 	itemCount?: number
// }

// export const Body: FC<Props> = ({ containerRef, columns, data, itemSize, itemCount }) => {
// 	const count = (itemCount || Size) > data.length ? data.length : itemCount || Size

// 	const virtualizer = useVirtualizer({
// 		count: count,
// 		estimateSize: () => itemSize || RowHeight,
// 		getScrollElement: () => containerRef,
// 		// overscan: 5,
// 	})

// 	return (
// 		<TableBody sx={{ display: 'grid', height: virtualizer.getTotalSize(), position: 'relative', width: '100%' }}>
// 			{virtualizer.getVirtualItems().map(item => (
// 				<TableRow
// 					key={item.key}
// 					// ref={node => virtualizer.measureElement(node)}
// 					sx={{ position: 'absolute', width: '100%', transform: `translateY(${item.start}px)` }}
// 				>
// 					{columns.map((c, i) => (
// 						<Cell key={c.id} label={data[item.index][c.id] || '-'} width={c.width} first={!i} />
// 					))}
// 				</TableRow>
// 			))}
// 		</TableBody>
// 	)
// }
