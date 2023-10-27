import { API } from '@/app/api'
import { apiSlice } from '@/app/apiSlice'
import { IDataItem, ISIFilter, ISIParams, ISISort } from './types/data'

const SIApiSlice = apiSlice.injectEndpoints({
	overrideExisting: false,
	endpoints: builder => ({
		getAllSI: builder.query<{ data: IDataItem[]; total: number }, ISIParams>({
			query: params => ({
				url: API.si.base,
				method: 'GET',
				params: new URLSearchParams([
					// params.page && params.page != 0 ? ['page', params.page.toString()] : null,
					...(params.page && params.page != 0 ? [['page', params.page.toString()]] : []),
					...(params.limit && params.limit != 50 ? [['count', params.limit.toString()]] : []),
					...(params.sort
						? Object.keys(params.sort).map(k => [`s-${k}`, params.sort![k as keyof ISISort]])
						: []),
					...(params.filter
						? Object.keys(params.filter).map(k => [`f-${k}`, params.filter![k as keyof ISIFilter]])
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
			onQueryStarted: async (_arg, api) => {
				try {
					await api.queryFulfilled
					// toast.success()
				} catch (error) {
					console.error(error)

					// const fetchError = error as FetchBaseQueryError
					// toast.error(fetchError.data.message)
				}
			},
		}),
	}),
})

export const { useGetAllSIQuery, useSaveSIMutation } = SIApiSlice
