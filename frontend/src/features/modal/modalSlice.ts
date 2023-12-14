import { RootState } from '@/app/store'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export type ModalSelectors = 'CreateDataItem' | 'NewVerification' | 'EditInstrument' | 'ChangeLocation'

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
