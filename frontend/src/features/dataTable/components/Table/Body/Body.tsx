import { FC, memo, useCallback } from 'react'
import { Stack } from '@mui/material'
import { FixedSizeList } from 'react-window'

import type { IDataItem } from '@/features/dataTable/types/data'
import { MaxSize, RowHeight, Size } from '@/constants/defaultValues'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { setSelected, getColumns, getSelected, getTableSize } from '@/features/dataTable/dataTableSlice'
import { Coordinates } from '@/features/dataTable/hooks/useContextMenu'
import { useGetAllSI } from '@/features/dataTable/hooks/getAllSI'
import { Fallback } from '@/components/Fallback/Fallback'
import { NoRowsOverlay } from '../../NoRowsOverlay/components/NoRowsOverlay'
import { Row } from './Row'

type Props = {
	itemId?: string
	positionHandler: (coordinates?: Coordinates, item?: IDataItem, isSelected?: boolean) => void
}

export const Body: FC<Props> = memo(({ itemId, positionHandler }) => {
	const size = useAppSelector(getTableSize)
	const columns = useAppSelector(getColumns)

	const selected = useAppSelector(getSelected)

	const dispatch = useAppDispatch()

	// const { itemId, positionHandler } = useContextMenu()

	const { data, isFetching } = useGetAllSI()

	const selectHandler = useCallback(
		// (item: ISelected, selected: boolean) => {
		// 	if (selected) dispatch(removeSelected(item.id))
		// 	else dispatch(addSelected(item))
		// },
		(item: IDataItem) => {
			dispatch(setSelected(item))
		},
		[dispatch]
	)

	if (!data) return null

	return (
		<Stack position={'relative'} height={'100%'}>
			{!data.total && <NoRowsOverlay />}

			{isFetching && (
				<Fallback
					position={'absolute'}
					top={'50%'}
					left={'50%'}
					transform={'translate(-50%, -50%)'}
					height={160}
					width={160}
					borderRadius={3}
					zIndex={15}
					backgroundColor={'#fafafa'}
				/>
			)}

			<FixedSizeList
				overscanCount={12}
				height={RowHeight * (size > Size ? MaxSize : Size)}
				itemCount={data.data.length > (size || Size) ? size || Size : data.data.length}
				itemSize={RowHeight}
				itemData={data}
				width={columns.reduce((ac, cur) => ac + (cur.hidden ? 0 : cur.width), 12)}
			>
				{({ index, style }) => (
					<Row
						data={data?.data[index]}
						style={style}
						// selected={selectedItems.some(s => s.id == data?.data[index]?.id)}
						selected={Boolean(selected[data?.data[index]?.id])}
						itemId={itemId}
						onSelect={selectHandler}
						positionHandler={positionHandler}
					/>
				)}
			</FixedSizeList>
		</Stack>
	)
})
