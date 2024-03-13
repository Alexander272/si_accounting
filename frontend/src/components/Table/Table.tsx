import { FC } from 'react'
import { Box, LinearProgress, Stack } from '@mui/material'

import { Column, ISort } from './type'
import { Head } from './Head/Head'
import { Body } from './Body/Body'

type Props = {
	columns: readonly Column[]
	data: Record<string, string>[]
	hasFilters?: boolean
	loading?: boolean
	height?: number
	itemSize?: number
	itemCount?: number
	sort?: ISort
	header?: JSX.Element
	contextMenu?: JSX.Element
	onSelect?: () => void
	onSort?: (field: string) => void
	onContext?: () => void
}

//TODO по хорошему всякие обработчики кликов и подобного надо передавать снаружи. контекстное меню тоже должно зависеть от таблицы
export const Table: FC<Props> = ({
	columns,
	data,
	hasFilters,
	height,
	itemCount,
	itemSize,
	loading,
	sort,
	header,
	contextMenu,
	// onSelect,
	onSort,
	// onContext,
}) => {
	//TODO таблица прокручивается плавно и быстро, но появляются белые пустые места
	// в проде пустота появляется только при очень быстром скроле от одного конца до другого (без tooltip)
	// с tooltip при быстром скроле таблица моргает и иногда проскакивают пустые места

	//TODO надо добавить цвета строк, фильтры, сортировку, контекстное меню
	return (
		<Stack sx={{ maxWidth: '100%', overflowY: 'hidden', overflowX: 'auto', position: 'relative' }}>
			{header ? header : <Head columns={columns} hasFilters={hasFilters} sort={sort} onSort={onSort} />}

			{loading && (
				<Box width={'100%'} marginY={'-2px'} height={4}>
					<LinearProgress />
				</Box>
			)}
			<Body columns={columns} data={data} height={height} itemCount={itemCount} itemSize={itemSize} />

			{contextMenu}
		</Stack>
	)
}
