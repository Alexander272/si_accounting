import { combineReducers, configureStore } from '@reduxjs/toolkit'
// import { setupListeners } from '@reduxjs/toolkit/dist/query'

import { apiSlice } from './apiSlice'
// import { resetStoreListener } from './middlewares/resetStore'

// import { authPath, authReducer } from '@/features/auth/authSlice'
// import { userPath, userReducer } from '@/features/user/userSlice'
import { dataTablePath, dataTableReducer } from '@/features/dataTable/dataTableSlice'
import { modalPath, modalReducer } from '@/features/modal/modalSlice'

const rootReducer = combineReducers({
	[apiSlice.reducerPath]: apiSlice.reducer,
	// [authPath]: authReducer,
	// [userPath]: userReducer,
	[dataTablePath]: dataTableReducer,
	[modalPath]: modalReducer,
})

export const store = configureStore({
	reducer: rootReducer,
	devTools: process.env.NODE_ENV === 'development',
	middleware: getDefaultMiddleware => getDefaultMiddleware().concat(apiSlice.middleware),
	// middleware: getDefaultMiddleware => getDefaultMiddleware().concat(apiSlice.middleware).concat(unauthenticatedMiddleware),
	// middleware: getDefaultMiddleware =>
	// 	getDefaultMiddleware().prepend(resetStoreListener.middleware).concat(apiSlice.middleware),
})

// setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
