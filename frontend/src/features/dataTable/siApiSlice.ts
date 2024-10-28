import { toast } from 'react-toastify'

import type { IBaseFetchError } from '@/app/types/error'
import type { IDataItem, ISIParams } from './types/data'
import type { INewSI } from './types/si'
import { API } from '@/app/api'
import { apiSlice } from '@/app/apiSlice'
import { SIMessages } from '@/constants/messages/siMessage'
import { buildSiUrlParams } from '@/utils/buildUrlParams'

const SIApiSlice = apiSlice.injectEndpoints({
	overrideExisting: false,
	endpoints: builder => ({
		getAllSI: builder.query<{ data: IDataItem[]; total: number }, ISIParams>({
			query: params => ({
				url: API.si.base,
				method: 'GET',
				params: buildSiUrlParams(params),
			}),
			providesTags: [{ type: 'SI', id: 'ALL' }],
			onQueryStarted: async (_arg, api) => {
				try {
					await api.queryFulfilled
				} catch (error) {
					const fetchError = (error as IBaseFetchError).error
					console.error(fetchError)
					toast.error(fetchError.data.message, { autoClose: false })
				}
			},
		}),

		getMovedSI: builder.query<{ data: IDataItem[]; total: number }, ISIParams>({
			query: params => ({
				url: API.si.moved,
				method: 'GET',
				params: buildSiUrlParams(params),
			}),
			providesTags: [{ type: 'SI', id: 'MOVED' }],
			onQueryStarted: async (_arg, api) => {
				try {
					await api.queryFulfilled
				} catch (error) {
					const fetchError = (error as IBaseFetchError).error
					console.error(fetchError)
					toast.error(fetchError.data.message, { autoClose: false })
				}
			},
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
					const fetchError = (error as IBaseFetchError).error
					console.error(fetchError)
					toast.error(fetchError.data.message, { autoClose: false })
				}
			},
		}),

		createSI: builder.mutation<string, INewSI>({
			query: data => ({
				url: API.si.base,
				method: 'POST',
				body: data,
			}),
			invalidatesTags: [
				{ type: 'SI', id: 'ALL' },
				{ type: 'SI', id: 'DRAFT' },
				{ type: 'Verification', id: 'documents' },
			],
			onQueryStarted: async (_arg, api) => {
				try {
					await api.queryFulfilled
					toast.success(SIMessages.SUCCESSFULLY_CREATED)
				} catch (error) {
					const fetchError = (error as IBaseFetchError).error
					console.error(fetchError)
					toast.error(fetchError.data.message, { autoClose: false })
				}
			},
		}),
	}),
})

export const { useGetAllSIQuery, useLazyGetAllSIQuery, useGetMovedSIQuery, useSaveSIMutation, useCreateSIMutation } =
	SIApiSlice
