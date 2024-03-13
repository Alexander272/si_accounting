import { FC } from 'react'
import { Stack, useTheme } from '@mui/material'

import type { Column, ISort } from '../type'
import { HeadCell } from './HeadCell'

type Props = {
	columns: readonly Column[]
	onSort?: (field: string) => void
	// onFilter?: () => void
	sort?: ISort
	hasFilters?: boolean
}

export const Head: FC<Props> = ({ columns, sort, onSort }) => {
	const { palette } = useTheme()

	// const HCell = hasFilters ? CellWithFilters : Cell

	return (
		<Stack
			direction={'row'}
			width={columns.reduce((ac, cur) => ac + cur.width, 10)}
			sx={{ borderBottom: `1px solid ${palette.primary.main}` }}
		>
			{columns.map((c, i) => (
				<HeadCell key={c.id} id={c.id} label={c.label} width={c.width} first={!i} sort={sort} onSort={onSort} />
				// <HCell key={c.id} id={c.id} label={c.label} width={c.width} first={!i} />
			))}
		</Stack>
	)
}
