import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import type { IDataItem, ISIFilter, ISISortObj, SIStatus, IColumn } from './types/data'
import { RootState } from '@/app/store'
import { localKeys } from '@/constants/localKeys'
import { Size } from '@/constants/defaultValues'
import { HeadCells } from './components/Table/Head/columns'
import { changeModalIsOpen } from '../modal/modalSlice'
import { setUser } from '../user/userSlice'

interface IDataTableSlice {
	status?: SIStatus
	page: number
	size: number
	sort: ISISortObj
	filter?: ISIFilter[]
	selected: { [x: string]: IDataItem }
	active?: IDataItem
	columns: IColumn[]
}

const initialState: IDataTableSlice = {
	page: +(localStorage.getItem(localKeys.page) || 1),
	size: +(localStorage.getItem(localKeys.size) || Size), // 15, 30, 50, 100 доступные лимиты. 15 строк макс (в chrome) который влазит без прокрутки
	sort: {
		nextVerificationDate: 'ASC',
	},
	selected: {},
	columns: JSON.parse(localStorage.getItem(localKeys.columns) || 'null') || HeadCells,
}

const dataTableSlice = createSlice({
	name: 'dataTable',
	initialState,
	reducers: {
		setStatus: (state, action: PayloadAction<SIStatus | undefined>) => {
			state.status = action.payload
		},
		setPage: (state, action: PayloadAction<number>) => {
			state.page = action.payload
			localStorage.setItem(localKeys.page, action.payload.toString())
		},
		setSize: (state, action: PayloadAction<number>) => {
			state.size = action.payload
			localStorage.setItem(localKeys.size, action.payload.toString())
		},

		setSort: (state, action: PayloadAction<keyof IDataItem>) => {
			if (!state.sort || !state.sort[action.payload]) {
				state.sort = { ...(state.sort || {}), [action.payload]: 'ASC' }
				return
			}

			if (state.sort[action.payload] == 'ASC') state.sort[action.payload] = 'DESC'
			else {
				delete state.sort[action.payload]
			}
		},

		setDefFilters: (state, action: PayloadAction<ISIFilter[]>) => {
			state.filter = action.payload
		},
		setFilters: (state, action: PayloadAction<ISIFilter | undefined>) => {
			if (!action.payload) {
				state.filter = undefined
				return
			}

			const index = state.filter?.findIndex(f => f.field == action.payload?.field)
			if (!state.filter || index == -1) {
				state.filter = [...(state.filter || []), action.payload]
			} else if (index != undefined) {
				if (action.payload.values.length) state.filter[index] = action.payload
				else state.filter = state.filter.filter(f => f.field != action.payload?.field)
			}
		},

		setSelected: (state, action: PayloadAction<IDataItem[] | IDataItem>) => {
			if (Array.isArray(action.payload))
				state.selected = action.payload.reduce((a, v) => ({ ...a, [v.id]: v }), {})
			else {
				if (state.selected[action.payload.id]) delete state.selected[action.payload.id]
				else state.selected[action.payload.id] = action.payload
			}
		},

		setActive: (state, action: PayloadAction<IDataItem | undefined>) => {
			state.active = action.payload
		},

		// setHidden: (state, action: PayloadAction<IHidden | undefined>) => {
		// 	if (action.payload) state.hidden = action.payload
		// 	else state.hidden = {}
		// 	localStorage.setItem(localKeys.hidden, JSON.stringify(state.hidden))
		// },
		setColumns: (state, action: PayloadAction<IColumn[]>) => {
			state.columns = action.payload
			localStorage.setItem(localKeys.columns, JSON.stringify(state.columns))
		},

		resetDataTableState: () => {
			localStorage.removeItem(localKeys.page)
			return initialState
		},
	},
	extraReducers: builder =>
		builder
			.addCase(changeModalIsOpen, (state, action) => {
				if (!action.payload) state.active = undefined
			})
			.addCase(setUser, (state, action) => {
				//TODO учесть что могут быть сохраненные фильтры
				if (action.payload.filters && action.payload.filters.length && !state.filter?.length) {
					state.filter = action.payload.filters
					// state.filter = action.payload.filters[0]
					// state.filter = [
					// 	{
					// 		field: action.payload.filters[0].field,
					// 		fieldType: action.payload.filters[0].fieldType,
					// 		values: [
					// 			{
					// 				compareType: action.payload.filters[0].compareType,
					// 				value: action.payload.filters[0].valueStart,
					// 			},
					// 		],
					// 	},
					// ]
				}
			}),
})

export const getSIStatus = (state: RootState) => state.dataTable.status
export const getTablePage = (state: RootState) => state.dataTable.page
export const getTableSize = (state: RootState) => state.dataTable.size
export const getTableSort = (state: RootState) => state.dataTable.sort
export const getTableFilter = (state: RootState) => state.dataTable.filter
export const getSelected = (state: RootState) => state.dataTable.selected
export const getActiveItem = (state: RootState) => state.dataTable.active
export const getColumns = (state: RootState) => state.dataTable.columns

export const dataTablePath = dataTableSlice.name
export const dataTableReducer = dataTableSlice.reducer

export const {
	setStatus,
	setPage,
	setSize,
	setSort,
	setDefFilters,
	setFilters,
	setSelected,
	setActive,
	setColumns,
	resetDataTableState,
} = dataTableSlice.actions
