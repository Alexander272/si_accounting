import { apiSlice } from '@/app/apiSlice'
import { API } from '@/app/api'
import { InstrumentFormType } from '../fields'

const instrumentApiSlice = apiSlice.injectEndpoints({
	overrideExisting: false,
	endpoints: builder => ({
		getInstrumentById: builder.query<{ data: InstrumentFormType }, string>({
			query: id => `${API.si.instruments.base}/${id}`,
			providesTags: [
				{ type: 'Instrument', id: 'ID' },
				{ type: 'SI', id: 'DRAFT' },
			],
		}),

		createInstrument: builder.mutation<string, InstrumentFormType>({
			query: data => ({
				url: API.si.instruments.base,
				method: 'POST',
				body: data,
			}),
			invalidatesTags: [{ type: 'Instrument', id: 'ID' }],
		}),

		updateInstrument: builder.mutation<string, InstrumentFormType>({
			query: data => ({
				url: `${API.si.instruments.base}/${data.id}`,
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: [
				{ type: 'Instrument', id: 'ID' },
				{ type: 'SI', id: 'ALL' },
			],
		}),
	}),
})

export const { useGetInstrumentByIdQuery, useCreateInstrumentMutation, useUpdateInstrumentMutation } =
	instrumentApiSlice
