import { FC, memo, useCallback } from 'react'
import { FixedSizeList } from 'react-window'

import { RowHeight, Size } from '@/constants/defaultValues'
import { Row } from './Row'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import {
	addSelected,
	getSelectedItems,
	getTableFilter,
	getTablePage,
	getTableSize,
	getTableSort,
	removeSelected,
} from '@/features/dataTable/dataTableSlice'
import { Coordinates } from '@/features/dataTable/hooks/useContextMenu'
import { useGetAllSIQuery } from '@/features/dataTable/siApiSlice'
import { ISelected, Status } from '@/features/dataTable/types/data'
import { HeadCells } from '../Head/columns'

type Props = {
	itemId?: string
	positionHandler: (coordinates?: Coordinates, itemId?: string, status?: Status, isSelected?: boolean) => void
}

export const Body: FC<Props> = memo(({ itemId, positionHandler }) => {
	const page = useAppSelector(getTablePage)
	const size = useAppSelector(getTableSize)

	const sort = useAppSelector(getTableSort)
	const filter = useAppSelector(getTableFilter)

	const selectedItems = useAppSelector(getSelectedItems)

	const dispatch = useAppDispatch()

	// const { itemId, positionHandler } = useContextMenu()

	const { data } = useGetAllSIQuery({ page, size, sort, filter }, { pollingInterval: 5 * 60000 })

	const selectHandler = useCallback(
		(item: ISelected, selected: boolean) => {
			if (selected) dispatch(removeSelected(item.id))
			else dispatch(addSelected(item))
		},
		[dispatch]
	)

	// if (true)
	// 	return (
	// 		<Stack flexGrow={1} height={100}>
	// 			<Typography>Поиск...</Typography>
	// 		</Stack>
	// 	)
	// if (isFetching) return <></>
	if (!data) return null

	return (
		<FixedSizeList
			overscanCount={12}
			height={RowHeight * Size}
			itemCount={size || Size}
			itemSize={RowHeight}
			itemData={data}
			width={HeadCells.reduce((ac, cur) => ac + cur.width, 10)}
		>
			{/* {true && (
				<Stack position={'absolute'} sx={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
					<Typography>Поиск...</Typography>
				</Stack>
			)} */}
			{({ index, style }) => (
				<Row
					data={data?.data[index]}
					style={style}
					selected={selectedItems.some(s => s.id == data?.data[index].id)}
					itemId={itemId}
					onSelect={selectHandler}
					positionHandler={positionHandler}
				/>
				// TODO при изменении selectedItems вся таблица отрисовывается заново
			)}
		</FixedSizeList>
	)
})
