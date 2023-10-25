import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { RootState } from '@/app/store'
import { IDataItem, ISISort } from './types/data'

interface IDataTableSlice {
	// sort: {
	// 	fieldId: keyof IDataItem | null
	// 	type: 'DESC' | 'ASC'
	// }
	sort: ISISort | null
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
					state.sort = null
				}
			} else {
				state.sort = { field: action.payload, type: 'ASC' }
			}
			// state.sortFieldId = action.payload
		},

		resetDataTableState: () => initialState,
	},
})

export const getTableSort = (state: RootState) => state.dataTable.sort

export const dataTablePath = dataTableSlice.name
export const dataTableReducer = dataTableSlice.reducer

export const { setSort, resetDataTableState } = dataTableSlice.actions
