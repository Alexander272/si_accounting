import { createSlice } from '@reduxjs/toolkit'

interface IModalState {
	open: boolean
	selector: 'CreateDataItem' | 'EditDataItem'
}

const initialState: IModalState = {
	open: false,
	selector: 'CreateDataItem',
}

const modalSlice = createSlice({
	name: 'modal',
	initialState,
	reducers: {
		resetModalState: () => initialState,
	},
})

export const modalPath = modalSlice.name
export const modalReducer = modalSlice.reducer

export const { resetModalState } = modalSlice.actions
