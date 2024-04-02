import { toast } from 'react-toastify'

import type { IBaseFetchError } from '@/app/types/error'
import { API } from '@/app/api'
import { apiSlice } from '@/app/apiSlice'
import { IDocument } from '@/features/files/types/file'

type Verification = {
	id?: string
	instrumentId: string
	date: string
	nextDate: string
	fileLink: string
	registerLink: string
	status: string
	notes: string
	// files?: File[]
	documents?: IDocument[]
}

const verificationApiSlice = apiSlice.injectEndpoints({
	overrideExisting: false,
	endpoints: builder => ({
		getLastVerification: builder.query<{ data: Verification }, string>({
			query: instrumentId => `${API.si.verification.base}/${instrumentId}`,
			providesTags: [
				{ type: 'Verification', id: 'LAST' },
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

		getVerificationByInstrumentId: builder.query<{ data: Verification[] }, string>({
			query: instrumentId => `${API.si.verification.all}/${instrumentId}`,
			providesTags: [{ type: 'Verification', id: 'all' }],
			onQueryStarted: (_arg, api) => {
				try {
					api.queryFulfilled
				} catch (error) {
					const fetchError = (error as IBaseFetchError).error
					toast.error(fetchError.data.message, { autoClose: false })
				}
			},
		}),

		createVerification: builder.mutation<string, Verification>({
			query: data => ({
				url: API.si.verification.base,
				method: 'POST',
				body: data,
			}),
			invalidatesTags: [
				{ type: 'Verification', id: 'LAST' },
				{ type: 'SI', id: 'ALL' },
			],
		}),

		updateVerification: builder.mutation<string, Verification>({
			query: data => ({
				url: `${API.si.verification.base}/${data.id}`,
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: [
				{ type: 'Verification', id: 'LAST' },
				{ type: 'SI', id: 'ALL' },
			],
		}),
	}),
})

export const {
	useGetLastVerificationQuery,
	useGetVerificationByInstrumentIdQuery,
	useCreateVerificationMutation,
	useUpdateVerificationMutation,
} = verificationApiSlice
