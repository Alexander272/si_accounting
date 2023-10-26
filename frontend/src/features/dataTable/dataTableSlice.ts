import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { RootState } from '@/app/store'
import { IDataItem, ISIFilter, ISISort } from './types/data'

interface IDataTableSlice {
	// sort: {
	// 	fieldId: keyof IDataItem | null
	// 	type: 'DESC' | 'ASC'
	// }
	sort?: ISISort
	filter?: ISIFilter
}

const initialState: IDataTableSlice = {
	sort: {
		field: 'nextVerificationDate',
		type: 'ASC',
	},
}

const dataTableSlice = createSlice({
	name: 'dataTable',
	initialState,
	reducers: {
		setSort: (state, action: PayloadAction<keyof IDataItem>) => {
			if (state.sort && state.sort.field == action.payload) {
				if (state.sort.type == 'ASC') {
					state.sort.type = 'DESC'
				} else {
					state.sort = undefined
				}
			} else {
				state.sort = { field: action.payload, type: 'ASC' }
			}
		},

		setFilters: (state, action: PayloadAction<ISIFilter | undefined>) => {
			state.filter = action.payload
		},

		resetDataTableState: () => initialState,
	},
})

export const getTableSort = (state: RootState) => state.dataTable.sort
export const getTableFilter = (state: RootState) => state.dataTable.filter

export const dataTablePath = dataTableSlice.name
export const dataTableReducer = dataTableSlice.reducer

export const { setSort, setFilters, resetDataTableState } = dataTableSlice.actions
