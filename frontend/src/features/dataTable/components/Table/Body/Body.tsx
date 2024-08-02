import { FC, memo, useCallback } from 'react'
import { Stack } from '@mui/material'
import { FixedSizeList } from 'react-window'

import type { ISelected, Status } from '@/features/dataTable/types/data'
import { RowHeight, Size } from '@/constants/defaultValues'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { addSelected, getSelectedItems, getTableSize, removeSelected } from '@/features/dataTable/dataTableSlice'
import { Coordinates } from '@/features/dataTable/hooks/useContextMenu'
import { useGetAllSI } from '@/features/dataTable/hooks/getAllSI'
import { Fallback } from '@/components/Fallback/Fallback'
import { HeadCells } from '../Head/columns'
import { NoRowsOverlay } from '../../NoRowsOverlay/components/NoRowsOverlay'
import { Row } from './Row'

type Props = {
	itemId?: string
	positionHandler: (coordinates?: Coordinates, itemId?: string, status?: Status, isSelected?: boolean) => void
}

export const Body: FC<Props> = memo(({ itemId, positionHandler }) => {
	const size = useAppSelector(getTableSize)

	const selectedItems = useAppSelector(getSelectedItems)

	const dispatch = useAppDispatch()

	// const { itemId, positionHandler } = useContextMenu()

	const { data, isFetching } = useGetAllSI()

	const selectHandler = useCallback(
		(item: ISelected, selected: boolean) => {
			if (selected) dispatch(removeSelected(item.id))
			else dispatch(addSelected(item))
		},
		[dispatch]
	)

	if (!data) return null

	return (
		<Stack position={'relative'}>
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
				height={RowHeight * Size}
				itemCount={data.data.length > (size || Size) ? size || Size : data.data.length}
				itemSize={RowHeight}
				itemData={data}
				width={HeadCells.reduce((ac, cur) => ac + cur.width, 0)}
			>
				{({ index, style }) => (
					<Row
						data={data?.data[index]}
						style={style}
						selected={selectedItems.some(s => s.id == data?.data[index]?.id)}
						itemId={itemId}
						onSelect={selectHandler}
						positionHandler={positionHandler}
					/>
					// TODO при изменении selectedItems вся таблица отрисовывается заново
				)}
			</FixedSizeList>
		</Stack>
	)
})
