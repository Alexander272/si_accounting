import { API } from '@/app/api'
import { apiSlice } from '@/app/apiSlice'
import { IDataItem, ISIParams, ISISort } from './types/data'

const SIApiSlice = apiSlice.injectEndpoints({
	overrideExisting: false,
	endpoints: builder => ({
		getAllSI: builder.query<{ data: IDataItem[] }, ISIParams>({
			query: params => ({
				url: API.si.base,
				method: 'GET',
				params: new URLSearchParams([
					...(params.sort
						? Object.keys(params.sort).map(k => [`sort-${k}`, params.sort![k as keyof ISISort]])
						: []),
				]),
			}),
			providesTags: [{ type: 'SI', id: 'ALL' }],
		}),

		saveSI: builder.mutation<string, string>({
			query: id => ({
				url: API.si.save,
				method: 'POST',
				body: { id },
			}),
			invalidatesTags: [
				{ type: 'SI', id: 'ALL' },
				{ type: 'SI', id: 'DRAFT' },
			],
		}),
	}),
})

export const { useGetAllSIQuery, useSaveSIMutation } = SIApiSlice
