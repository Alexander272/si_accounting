import { toast } from 'react-toastify'

import type { IBaseFetchError } from '@/app/types/error'
import type { IRealm, IRealmDTO } from './types/realm'
import { API } from '@/app/api'
import { apiSlice } from '@/app/apiSlice'

export const realmsApiSlice = apiSlice.injectEndpoints({
	overrideExisting: false,
	endpoints: builder => ({
		getRealms: builder.query<{ data: IRealm[] }, { all: boolean }>({
			query: ({ all }) => ({
				url: API.realms,
				method: 'GET',
				params: all ? { all } : undefined,
			}),
			providesTags: [{ type: 'Realms', id: 'ALL' }],
			onQueryStarted: async (_arg, api) => {
				try {
					await api.queryFulfilled
				} catch (error) {
					console.log(error)
					const fetchError = (error as IBaseFetchError).error
					toast.error(fetchError.data.message, { autoClose: false })
				}
			},
		}),
		getRealmById: builder.query<{ data: IRealm }, string>({
			query: id => ({
				url: `${API.realms}/${id}`,
				method: 'GET',
			}),
			providesTags: (_res, _err, arg) => [{ type: 'Realms', id: arg }],
			onQueryStarted: async (_arg, api) => {
				try {
					await api.queryFulfilled
				} catch (error) {
					console.log(error)
					const fetchError = (error as IBaseFetchError).error
					toast.error(fetchError.data.message, { autoClose: false })
				}
			},
		}),

		createRealm: builder.mutation<{ id: string }, IRealmDTO>({
			query: data => ({
				url: API.realms,
				method: 'POST',
				body: data,
			}),
			invalidatesTags: [{ type: 'Realms', id: 'ALL' }],
		}),

		updateRealm: builder.mutation<null, IRealmDTO>({
			query: data => ({
				url: `${API.realms}/${data.id}`,
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: (_res, _err, arg) => [
				{ type: 'Realms', id: arg.id },
				{ type: 'Realms', id: 'ALL' },
			],
		}),

		deleteRealm: builder.mutation<null, string>({
			query: id => ({
				url: `${API.realms}/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: [{ type: 'Realms', id: 'ALL' }],
		}),
	}),
})

export const {
	useGetRealmsQuery,
	useGetRealmByIdQuery,
	useCreateRealmMutation,
	useUpdateRealmMutation,
	useDeleteRealmMutation,
} = realmsApiSlice
