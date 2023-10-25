import { API } from '@/app/api'
import { apiSlice } from '@/app/apiSlice'

type Location = {
	id?: string
	instrumentId: string
	department: string
	person: string
	receiptDate: string
	deliveryDate: string
	status: string
}

const locationApiSlice = apiSlice.injectEndpoints({
	overrideExisting: false,
	endpoints: builder => ({
		getLastLocation: builder.query<{ data: Location }, string>({
			query: instrumentId => `${API.si.location.base}/${instrumentId}`,
			providesTags: [
				{ type: 'Location', id: 'LAST' },
				{ type: 'SI', id: 'DRAFT' },
			],
		}),

		createLocation: builder.mutation<string, Location>({
			query: data => ({
				url: API.si.location.base,
				method: 'POST',
				body: data,
			}),
		}),

		updateLocation: builder.mutation<string, Location>({
			query: data => ({
				url: `${API.si.location.base}/${data.id}`,
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: [{ type: 'Location', id: 'LAST' }],
		}),
	}),
})

export const { useGetLastLocationQuery, useCreateLocationMutation, useUpdateLocationMutation } = locationApiSlice
