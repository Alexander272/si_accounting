import { combineReducers, configureStore } from '@reduxjs/toolkit'
// import { setupListeners } from '@reduxjs/toolkit/dist/query'

// import { apiSlice } from './apiSlice'
// import { resetStoreListener } from './middlewares/resetStore'

// import { authPath, authReducer } from '@/features/auth/authSlice'
// import { userPath, userReducer } from '@/features/user/userSlice'

const rootReducer = combineReducers({
	// [apiSlice.reducerPath]: apiSlice.reducer,
	// [authPath]: authReducer,
	// [userPath]: userReducer,
})

export const store = configureStore({
	reducer: rootReducer,
	devTools: process.env.NODE_ENV === 'development',
	// middleware: getDefaultMiddleware =>
	// 	getDefaultMiddleware().prepend(resetStoreListener.middleware).concat(apiSlice.middleware),
})

// setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
