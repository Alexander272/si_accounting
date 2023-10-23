import { apiSlice } from '@/app/apiSlice'
import { API } from '@/app/api'
import { InstrumentFormType } from '../fields'

const instrumentApiSlice = apiSlice.injectEndpoints({
	overrideExisting: false,
	endpoints: builder => ({
		getInstrumentById: builder.query<{ data: InstrumentFormType }, string>({
			query: id => `${API.si.instruments.base}/${id}`,
			providesTags: [{ type: 'Instrument', id: 'ID' }],
		}),

		createInstrument: builder.mutation<string, InstrumentFormType>({
			query: data => ({
				url: API.si.instruments.base,
				method: 'POST',
				body: data,
			}),
		}),

		updateInstrument: builder.mutation<string, InstrumentFormType>({
			query: data => ({
				url: `${API.si.instruments.base}/${data.id}`,
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: [{ type: 'Instrument', id: 'ID' }],
		}),
	}),
})

export const { useGetInstrumentByIdQuery, useCreateInstrumentMutation, useUpdateInstrumentMutation } =
	instrumentApiSlice
