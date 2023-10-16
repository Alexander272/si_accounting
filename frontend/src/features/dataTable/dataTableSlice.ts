import { createSlice } from '@reduxjs/toolkit'

interface IDataTableSlice {}

const initialState: IDataTableSlice = {}

const dataTableSlice = createSlice({
	name: 'dataTable',
	initialState,
	reducers: {
		resetDataTableState: () => initialState,
	},
})

export const dataTablePath = dataTableSlice.name
export const dataTableReducer = dataTableSlice.reducer

export const { resetDataTableState } = dataTableSlice.actions
