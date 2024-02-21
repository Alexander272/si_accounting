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
	getTableLimit,
	getTablePage,
	getTableSort,
	removeSelected,
} from '../dataTableSlice'
import { ContextMenu } from './ContextMenu/ContextMenu'
import { DataTableRow } from './DataTableRow'

export const DataTableBody = () => {
	const page = useAppSelector(getTablePage)
	const limit = useAppSelector(getTableLimit)

	const sort = useAppSelector(getTableSort)
	const filter = useAppSelector(getTableFilter)

	const selectedItems = useAppSelector(getSelectedItems)

	const dispatch = useAppDispatch()

	const { coordinates, isSelected, itemId, status, positionHandler } = useContextMenu()

	const { data } = useGetAllSIQuery({ page, limit, sort, filter }, { pollingInterval: 5 * 60000 })

	const selectHandler = useCallback(
		(item: ISelected, selected: boolean) => {
			if (selected) dispatch(removeSelected(item.id))
			else dispatch(addSelected(item))
		},
		[dispatch]
	)

	return (
		<TableBody>
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
