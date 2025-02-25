import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'

import { dataTablePath, dataTableReducer } from '@/features/dataTable/dataTableSlice'
import { modalPath, modalReducer } from '@/features/modal/modalSlice'
import { dialogPath, dialogReducer } from '@/features/dialog/dialogSlice'
import { employeesPath, employeesReducer } from '@/features/employees/employeeSlice'
import { userPath, userReducer } from '@/features/user/userSlice'
import { realmPath, realmReducer } from '@/features/realms/realmSlice'
import { resetStoreListener } from './middlewares/resetStore'
import { apiSlice } from './apiSlice'

const rootReducer = combineReducers({
	[apiSlice.reducerPath]: apiSlice.reducer,
	[dataTablePath]: dataTableReducer,
	[modalPath]: modalReducer,
	[dialogPath]: dialogReducer,
	[employeesPath]: employeesReducer,
	[userPath]: userReducer,
	[realmPath]: realmReducer,
})

export const store = configureStore({
	reducer: rootReducer,
	devTools: process.env.NODE_ENV === 'development',
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware().prepend(resetStoreListener.middleware).concat(apiSlice.middleware),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
