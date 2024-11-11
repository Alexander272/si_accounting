import { toast } from 'react-toastify'

import type { IBaseFetchError } from '@/app/types/error'
import type { IUserData } from './types/user'
import { API } from '@/app/api'
import { apiSlice } from '@/app/apiSlice'

export const usersApiSlice = apiSlice.injectEndpoints({
	overrideExisting: false,
	endpoints: builder => ({
		getAllUsers: builder.query<{ data: IUserData[] }, null>({
			query: () => ({
				url: API.users,
				method: 'GET',
			}),
			providesTags: [{ type: 'Users', id: 'all' }],
			onQueryStarted: async (_arg, api) => {
				try {
					await api.queryFulfilled
				} catch (error) {
					const fetchError = (error as IBaseFetchError).error
					toast.error(fetchError.data.message, { autoClose: false })
				}
			},
		}),
	}),
})

export const { useGetAllUsersQuery } = usersApiSlice
