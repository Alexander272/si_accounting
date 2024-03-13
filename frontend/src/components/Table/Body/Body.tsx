import { FC, memo } from 'react'
import { FixedSizeList } from 'react-window'

import type { Column } from '../type'
import { RowHeight, Size } from '@/constants/defaultValues'
import { Row } from './Row'

type Props = {
	columns: readonly Column[]
	data: Record<string, string>[]
	height?: number
	itemSize?: number
	itemCount?: number
}

export const Body: FC<Props> = memo(({ columns, data, height, itemCount, itemSize }) => {
	return (
		<FixedSizeList
			overscanCount={12}
			height={height || RowHeight * Size}
			itemCount={itemCount || Size}
			itemSize={itemSize || RowHeight}
			itemData={data}
			width={columns.reduce((ac, cur) => ac + cur.width, 10)}
		>
			{({ index, style }) => <Row columns={columns} data={data[index]} style={style} />}
		</FixedSizeList>
	)
})
