import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
// import { type Middleware, type MiddlewareAPI, isRejectedWithValue } from '@reduxjs/toolkit'

import { BaseUrl } from '@/constants/baseUrl'

const baseQuery = fetchBaseQuery({
	baseUrl: BaseUrl,
	mode: 'cors',
})

export const apiSlice = createApi({
	reducerPath: 'api',
	baseQuery: baseQuery,
	tagTypes: ['SI', 'Instrument', 'Verification', 'Location', 'Departments', 'Employees'],
	endpoints: () => ({}),
})

// TODO убрать комментарий с Middleware
// проверка статуса ответа. если он 401, то пользователь не авторизован и его надо выкинуть на страницу авторизации
// export const unauthenticatedMiddleware: Middleware =
// 	({ dispatch }: MiddlewareAPI) =>
// 	next =>
// 	action => {
// 		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
// 		if (isRejectedWithValue(action) && action.payload.status === 401) {
// 			dispatch(clearUser())
// 		}
// 		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
// 		return next(action)
// 	}
