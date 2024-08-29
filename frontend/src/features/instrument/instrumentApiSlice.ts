import { toast } from 'react-toastify'

import type { IBaseFetchError } from '@/app/types/error'
import type { Instrument } from './types/instrument'
import { apiSlice } from '@/app/apiSlice'
import { API } from '@/app/api'
import { DraftKey } from '@/constants/localKeys'

const instrumentApiSlice = apiSlice.injectEndpoints({
	overrideExisting: false,
	endpoints: builder => ({
		getInstrumentById: builder.query<{ data: Instrument }, string>({
			query: id => `${API.si.instruments.base}/${id}`,
			providesTags: [
				{ type: 'Instrument', id: 'ID' },
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

		createInstrument: builder.mutation<string, Instrument>({
			query: data => ({
				url: API.si.instruments.base,
				method: 'POST',
				body: data,
			}),
			invalidatesTags: [{ type: 'Instrument', id: 'ID' }],
		}),

		updateInstrument: builder.mutation<string, Instrument>({
			query: data => ({
				url: `${API.si.instruments.base}/${data.id}`,
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: (_res, _err, data) => [
				{ type: 'Instrument', id: 'ID' },
				{ type: 'SI', id: data.status != DraftKey ? 'ALL' : 'DRAFT' },
			],
		}),

		deleteInstrument: builder.mutation<void, Instrument>({
			query: data => ({
				url: `${API.si.instruments.base}/${data.id}`,
				method: 'DELETE',
			}),
			invalidatesTags: (_res, _err, data) => [
				{ type: 'Instrument', id: 'ID' },
				{ type: 'SI', id: data.status != DraftKey ? 'ALL' : 'DRAFT' },
			],
		}),
	}),
})

export const {
	useGetInstrumentByIdQuery,
	useCreateInstrumentMutation,
	useUpdateInstrumentMutation,
	useDeleteInstrumentMutation,
} = instrumentApiSlice
