import { toast } from 'react-toastify'

import type { IBaseFetchError } from '@/app/types/error'
import type { Location } from './types/location'
import { API } from '@/app/api'
import { apiSlice } from '@/app/apiSlice'

const locationApiSlice = apiSlice.injectEndpoints({
	overrideExisting: false,
	endpoints: builder => ({
		getLastLocation: builder.query<{ data: Location }, string>({
			query: instrumentId => `${API.si.location.base}/${instrumentId}`,
			providesTags: [
				{ type: 'Location', id: 'LAST' },
				{ type: 'SI', id: 'DRAFT' },
			],
			onQueryStarted: (_arg, api) => {
				try {
					api.queryFulfilled
				} catch (error) {
					const fetchError = (error as IBaseFetchError).error
					toast.error(fetchError.data.message, { autoClose: false })
				}
			},
		}),

		getLocationsByInstrumentId: builder.query<{ data: Location[] }, string>({
			query: instrumentId => `${API.si.location.all}/${instrumentId}`,
			providesTags: [{ type: 'Location', id: 'ALL' }],
			onQueryStarted: (_arg, api) => {
				try {
					api.queryFulfilled
				} catch (error) {
					const fetchError = (error as IBaseFetchError).error
					toast.error(fetchError.data.message, { autoClose: false })
				}
			},
		}),

		createLocation: builder.mutation<string, Location>({
			query: data => ({
				url: API.si.location.base,
				method: 'POST',
				body: data,
			}),
			invalidatesTags: [
				{ type: 'Location', id: 'ALL' },
				{ type: 'Location', id: 'LAST' },
				{ type: 'SI', id: 'ALL' },
			],
		}),
		createSeveralLocation: builder.mutation<{ message: string }, Location[]>({
			query: data => ({
				url: `${API.si.location.base}/several`,
				method: 'POST',
				body: { locations: data },
			}),
			invalidatesTags: [
				{ type: 'Location', id: 'ALL' },
				{ type: 'Location', id: 'LAST' },
				{ type: 'SI', id: 'ALL' },
			],
		}),

		updateLocation: builder.mutation<string, Location>({
			query: data => ({
				url: `${API.si.location.base}/${data.id}`,
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: [
				{ type: 'Location', id: 'LAST' },
				{ type: 'Location', id: 'ALL' },
				{ type: 'SI', id: 'ALL' },
			],
		}),

		deleteLocation: builder.mutation<string, string>({
			query: id => ({
				url: `${API.si.location.base}/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: [
				{ type: 'Location', id: 'LAST' },
				{ type: 'Location', id: 'ALL' },
				{ type: 'SI', id: 'ALL' },
			],
		}),
	}),
})

export const {
	useGetLastLocationQuery,
	useGetLocationsByInstrumentIdQuery,
	useCreateLocationMutation,
	useCreateSeveralLocationMutation,
	useUpdateLocationMutation,
	useDeleteLocationMutation,
} = locationApiSlice
