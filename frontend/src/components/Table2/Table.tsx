// import { FC } from 'react'
// import { Table as MTable } from '@mui/material'

// import type { Column } from './type'
// import { Head } from './Head/Head'
// import { Body } from './Body/Body'

// type Props = {
// 	containerRef: HTMLElement | null
// 	columns: readonly Column[]
// 	data: Record<string, string>[]
// 	hasFilters?: boolean
// 	height?: number
// 	itemSize?: number
// 	itemCount?: number
// }

// //TODO по хорошему всякие обработчики кликов и подобного надо передавать снаружи. контекстное меню тоже должно зависеть от таблицы
// export const Table2: FC<Props> = ({ containerRef, columns, data, hasFilters, height, itemSize, itemCount }) => {
// 	//TODO таблица подлагивает (зато белых мест нет, даже при быстром скроле)
// 	// в проде лагов нет, все нормально отрабатывает (без tooltip, у меня на компе)
// 	// с tooltip появились небольшие тормоза (плавности не чувствуется)
// 	return (
// 		<MTable stickyHeader size='small'>
// 			<Head columns={columns} hasFilters={hasFilters} />
// 			<Body
// 				containerRef={containerRef}
// 				columns={columns}
// 				data={data}
// 				itemCount={itemCount}
// 				itemSize={itemSize}
// 				height={height}
// 			/>
// 		</MTable>
// 	)
// }
