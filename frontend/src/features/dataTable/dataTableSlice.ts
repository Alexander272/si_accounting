import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import type { IDataItem, ISIFilter, ISISortObj, ISelected, SIStatus } from './types/data'
import { RootState } from '@/app/store'
import { localKeys } from '@/constants/localKeys'
import { Size } from '@/constants/defaultValues'
import { changeModalIsOpen } from '../modal/modalSlice'
import { setUser } from '../user/userSlice'

interface IDataTableSlice {
	status?: SIStatus
	page: number
	size: number
	// sort?: ISISort
	// sort2?: ISISort[]
	sort: ISISortObj
	filter?: ISIFilter[]
	// filterNew?: ISIFilterNew[]
	selected: ISelected[]
	active?: ISelected
}

const initialState: IDataTableSlice = {
	page: +(localStorage.getItem(localKeys.page) || 1),
	size: +(localStorage.getItem(localKeys.size) || Size), // 15, 30, 50, 100 доступные лимиты. 15 строк макс (в chrome) который влазит без прокрутки
	// sort: {
	// 	field: 'nextVerificationDate',
	// 	type: 'ASC',
	// },
	sort: {
		nextVerificationDate: 'ASC',
	},
	selected: [],
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
			// if (state.sort && state.sort.field == action.payload) {
			// 	if (state.sort.type == 'ASC') {
			// 		state.sort.type = 'DESC'
			// 	} else {
			// 		state.sort = undefined
			// 	}
			// } else {
			// 	state.sort = { field: action.payload, type: 'ASC' }
			// }

			// const index = state.sort2?.findIndex(s => s.field == action.payload)
			// if (!state.sort2 || index == -1) {
			// 	state.sort2 = [...(state.sort2 || []), { field: action.payload, type: 'ASC' }]
			// } else if (index != undefined) {
			// 	if (state.sort2[index].type == 'ASC') state.sort2[index].type = 'DESC'
			// 	else state.sort2 = state.sort2.filter(s => s.field != action.payload)
			// }

			if (!state.sort || !state.sort[action.payload]) {
				state.sort = { ...(state.sort || {}), [action.payload]: 'ASC' }
				return
			}

			if (state.sort[action.payload] == 'ASC') state.sort[action.payload] = 'DESC'
			else {
				delete state.sort[action.payload]
			}
		},

		// setFilters: (state, action: PayloadAction<ISIFilter | undefined>) => {
		// 	state.filter = action.payload
		// },
		setFilters: (state, action: PayloadAction<ISIFilter | undefined>) => {
			// state.filter = action.payload

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
				if (action.payload.filters && action.payload.filters.length) {
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
export const getSelectedItems = (state: RootState) => state.dataTable.selected
export const getActiveItem = (state: RootState) => state.dataTable.active

export const dataTablePath = dataTableSlice.name
export const dataTableReducer = dataTableSlice.reducer

export const {
	setStatus,
	setPage,
	setSize,
	setSort,
	setFilters,
	addSelected,
	removeSelected,
	setActive,
	resetDataTableState,
} = dataTableSlice.actions
