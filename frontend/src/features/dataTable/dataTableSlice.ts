import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { RootState } from '@/app/store'
import { IDataItem, ISIFilter, ISISort } from './types/data'

interface IDataTableSlice {
	page: number
	limit: number
	sort?: ISISort
	filter?: ISIFilter
	selected: string[]
}

const initialState: IDataTableSlice = {
	page: 1,
	//TODO вернуть лимит в 50
	limit: 15, // 15, 30, 50, 100 доступные лимиты. 15 строк макс который влазит без прокрутки
	sort: {
		field: 'nextVerificationDate',
		type: 'ASC',
	},
	selected: [],
}

const dataTableSlice = createSlice({
	name: 'dataTable',
	initialState,
	reducers: {
		setPage: (state, action: PayloadAction<number>) => {
			state.page = action.payload
		},
		setLimit: (state, action: PayloadAction<number>) => {
			state.limit = action.payload
		},

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

		addSelected: (state, action: PayloadAction<string | string[]>) => {
			if (typeof action.payload == 'string') state.selected.push(action.payload)
			else state.selected.push(...action.payload)
		},
		removeSelected: (state, action: PayloadAction<string | undefined>) => {
			if (action.payload != undefined) state.selected = state.selected.filter(s => s != action.payload)
			else state.selected = []
		},

		resetDataTableState: () => initialState,
	},
})

export const getTablePage = (state: RootState) => state.dataTable.page
export const getTableLimit = (state: RootState) => state.dataTable.limit
export const getTableSort = (state: RootState) => state.dataTable.sort
export const getTableFilter = (state: RootState) => state.dataTable.filter
export const getSelectedItems = (state: RootState) => state.dataTable.selected

export const dataTablePath = dataTableSlice.name
export const dataTableReducer = dataTableSlice.reducer

export const { setPage, setLimit, setSort, setFilters, addSelected, removeSelected, resetDataTableState } =
	dataTableSlice.actions
