import { CSSProperties, FC, memo } from 'react'
import { Stack } from '@mui/material'

import type { Column } from '../type'
import { Cell } from '../Cell/Cell'

type Props = {
	columns: readonly Column[]
	data: Record<string, string>
	style: CSSProperties
}

export const Row: FC<Props> = memo(({ columns, data, style }) => {
	if (!data) return null

	return (
		<Stack direction={'row'} style={style} sx={{ borderRadius: 1, cursor: 'pointer' }}>
			{columns.map((c, i) => (
				<Cell key={c.id} width={c.width} label={data[c.id] || '-'} first={!i} />
			))}
		</Stack>
	)
})
