import { FC } from 'react'
import { TableHead, TableRow } from '@mui/material'

import type { Column } from '../type'
import { CellWithFilters } from '../Cell/CellWithFilters'
import { Cell } from '../Cell/Cell'

type Props = {
	columns: readonly Column[]
	hasFilters?: boolean
}

export const Head: FC<Props> = ({ columns, hasFilters }) => {
	// const { palette } = useTheme()

	const HCell = hasFilters ? CellWithFilters : Cell

	return (
		<TableHead>
			<TableRow>
				{columns.map((c, i) => (
					<HCell key={c.id} id={c.id} label={c.label} width={c.width} first={!i} />
				))}
			</TableRow>
		</TableHead>
	)
}
