import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { RootState } from '@/app/store'
import { IDataItem } from './types/data'

interface IDataTableSlice {
	sort: {
		fieldId: keyof IDataItem | null
		type: 'DESC' | 'ASC'
	}
}

const initialState: IDataTableSlice = {
	sort: {
		fieldId: 'nextVerificationDate',
		type: 'DESC',
	},
}

const dataTableSlice = createSlice({
	name: 'dataTable',
	initialState,
	reducers: {
		setSort: (state, action: PayloadAction<keyof IDataItem>) => {
			if (state.sort.fieldId == action.payload) {
				if (state.sort.type == 'DESC') {
					state.sort.type = 'ASC'
				} else {
					state.sort = { fieldId: null, type: 'DESC' }
				}
			} else {
				state.sort = { fieldId: action.payload, type: 'DESC' }
			}
			// state.sortFieldId = action.payload
		},

		resetDataTableState: () => initialState,
	},
})

export const dataTablePath = dataTableSlice.name
export const dataTableReducer = dataTableSlice.reducer

export const getTableSort = (state: RootState) => state.dataTable.sort

export const { setSort, resetDataTableState } = dataTableSlice.actions
