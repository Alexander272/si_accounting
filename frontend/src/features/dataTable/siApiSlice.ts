import { API } from '@/app/api'
import { apiSlice } from '@/app/apiSlice'
import { IDataItem, ISIFilter, ISIParams, ISISort } from './types/data'
import { IFetchError } from '@/app/types/error'
import { toast } from 'react-toastify'
import { SIMessages } from '@/constants/messages/siMessage'

const SIApiSlice = apiSlice.injectEndpoints({
	overrideExisting: false,
	endpoints: builder => ({
		getAllSI: builder.query<{ data: IDataItem[]; total: number }, ISIParams>({
			query: params => ({
				url: API.si.base,
				method: 'GET',
				params: new URLSearchParams([
					// params.page && params.page != 0 ? ['page', params.page.toString()] : null,
					...(params.page && params.page != 1 ? [['page', params.page.toString()]] : []),
					...(params.limit && params.limit != 15 ? [['count', params.limit.toString()]] : []),
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
					toast.success(SIMessages.SUCCESSFULLY_CREATED)
				} catch (error) {
					const fetchError = error as IFetchError
					console.error(fetchError)
					toast.error(fetchError.data.message, { autoClose: false })
				}
			},
		}),
	}),
})

export const { useGetAllSIQuery, useLazyGetAllSIQuery, useSaveSIMutation } = SIApiSlice
