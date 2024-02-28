import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import type { IDataItem, ISIFilter, ISIFilterNew, ISISort, ISelected } from './types/data'
import { RootState } from '@/app/store'
import { localKeys } from '@/constants/localKeys'
import { Size } from '@/constants/defaultValues'
import { changeModalIsOpen } from '../modal/modalSlice'

interface IDataTableSlice {
	page: number
	size: number
	sort?: ISISort
	filter?: ISIFilter
	filterNew?: ISIFilterNew
	selected: ISelected[]
	active?: ISelected
}

const initialState: IDataTableSlice = {
	page: +(localStorage.getItem(localKeys.page) || 1),
	size: +(localStorage.getItem(localKeys.size) || Size), // 15, 30, 50, 100 доступные лимиты. 15 строк макс который влазит без прокрутки
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
		setSize: (state, action: PayloadAction<number>) => {
			state.size = action.payload
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
		setFilterNew: (state, action: PayloadAction<ISIFilterNew | undefined>) => {
			state.filterNew = action.payload
		},

		addSelected: (state, action: PayloadAction<ISelected | ISelected[]>) => {
			if (Array.isArray(action.payload)) state.selected.push(...action.payload)
			else state.selected.push(action.payload)
		},
		removeSelected: (state, action: PayloadAction<string | undefined>) => {
			if (action.payload != undefined) state.selected = state.selected.filter(s => s.id != action.payload)
			else state.selected = []
		},

		setActive: (state, action: PayloadAction<ISelected | undefined>) => {
			state.active = action.payload
		},

		resetDataTableState: () => initialState,
	},
	extraReducers: builder =>
		builder.addCase(changeModalIsOpen, (state, action) => {
			if (!action.payload) state.active = undefined
		}),
})

export const getTablePage = (state: RootState) => state.dataTable.page
export const getTableSize = (state: RootState) => state.dataTable.size
export const getTableSort = (state: RootState) => state.dataTable.sort
export const getTableFilter = (state: RootState) => state.dataTable.filter
export const getTableFilterNew = (state: RootState) => state.dataTable.filterNew
export const getSelectedItems = (state: RootState) => state.dataTable.selected
export const getActiveItem = (state: RootState) => state.dataTable.active

export const dataTablePath = dataTableSlice.name
export const dataTableReducer = dataTableSlice.reducer

export const {
	setPage,
	setSize,
	setSort,
	setFilters,
	setFilterNew,
	addSelected,
	removeSelected,
	setActive,
	resetDataTableState,
} = dataTableSlice.actions
