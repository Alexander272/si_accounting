import { useCallback } from 'react'
import { TableBody } from '@mui/material'

import type { ISelected } from '../types/data'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useGetAllSIQuery } from '../siApiSlice'
import { useContextMenu } from '../hooks/useContextMenu'
import {
	addSelected,
	getSelectedItems,
	getTableFilter,
	getTablePage,
	getTableSize,
	getTableSort,
	removeSelected,
} from '../dataTableSlice'
import { ContextMenu } from './ContextMenu/ContextMenu'
import { DataTableRow } from './DataTableRow'

export const DataTableBody = () => {
	const page = useAppSelector(getTablePage)
	const size = useAppSelector(getTableSize)

	const sort = useAppSelector(getTableSort)
	const filter = useAppSelector(getTableFilter)

	const selectedItems = useAppSelector(getSelectedItems)

	const dispatch = useAppDispatch()

	const { coordinates, isSelected, itemId, status, positionHandler } = useContextMenu()

	const { data } = useGetAllSIQuery(
		{ page, size, sort, filter: filter ? [filter] : [] },
		{ pollingInterval: 5 * 60000 }
	)

	const selectHandler = useCallback(
		(item: ISelected, selected: boolean) => {
			if (selected) dispatch(removeSelected(item.id))
			else dispatch(addSelected(item))
		},
		[dispatch]
	)

	return (
		<TableBody>
			{/* <FixedSizeGrid
				rowCount={size}
				columnCount={Object.keys(data?.data[0] || {}).length}
				rowHeight={37}
				height={640}
			>
				{({ columnIndex, rowIndex, style }) => (
					<div style={style}>
						row {rowIndex}, column {columnIndex}
					</div>
				)}
			</FixedSizeGrid> */}
			{/* <FixedSizeList
				outerElementType='table'
				innerElementType='tbody'
				itemCount={size}
				itemSize={37}
				width={'100%'}
				height={555}
				overscanCount={5}
			>
				{({ index, style }) => <tr style={style}>Item {index}</tr>}
			</FixedSizeList> */}

			{data?.data.map(d => {
				// const selected = selectedItems.includes(d.id)
				const selected = selectedItems.some(s => s.id == d.id)

				return (
					<DataTableRow
						key={d.id}
						data={d}
						selected={selected}
						itemId={itemId}
						onSelect={selectHandler}
						positionHandler={positionHandler}
					/>
				)
			})}

			<ContextMenu
				coordinates={coordinates}
				isSelected={isSelected}
				itemId={itemId}
				status={status}
				positionHandler={positionHandler}
			/>
		</TableBody>
	)
}
