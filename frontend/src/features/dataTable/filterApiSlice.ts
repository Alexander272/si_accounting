import { API } from '@/app/api'
import { apiSlice } from '@/app/apiSlice'
import { ISIFilter } from './types/data'

const filterApiSlice = apiSlice.injectEndpoints({
	overrideExisting: false,
	endpoints: builder => ({
		saveFilters: builder.mutation<void, ISIFilter[]>({
			query: data => ({
				url: API.filters,
				method: 'POST',
				body: data,
			}),
		}),
	}),
})

export const { useSaveFiltersMutation } = filterApiSlice
