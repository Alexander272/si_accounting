import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { RootState } from '@/app/store'

export type ModalSelectors =
	| 'CreateDataItem'
	| 'EditDataItem'
	| 'NewVerification'
	| 'NewLocation'
	| 'DeleteLocation'
	| 'SendToReserve'
	| 'CreateEmployee'
	| 'EditEmployee'
	| 'CreateDepartment'
	| 'EditDepartment'
	| 'Confirm'
	| 'ViewLocationHistory'
	| 'ViewVerificationHistory'
	| 'Period'
	| 'Test'

interface IModalState {
	open: boolean
	selector: ModalSelectors
}

const initialState: IModalState = {
	open: false,
	selector: 'CreateDataItem',
}

const modalSlice = createSlice({
	name: 'modal',
	initialState,
	reducers: {
		setModalSelector: (state, action: PayloadAction<ModalSelectors>) => {
			state.selector = action.payload
		},
		changeModalIsOpen: (state, action: PayloadAction<boolean>) => {
			state.open = action.payload
		},
		resetModalState: () => initialState,
	},
})

export const getModalSelector = (state: RootState) => state.modal.selector
export const getIsOpenModal = (state: RootState) => state.modal.open

export const modalPath = modalSlice.name
export const modalReducer = modalSlice.reducer

export const { setModalSelector, changeModalIsOpen, resetModalState } = modalSlice.actions
