import { toast } from 'react-toastify'

import type { IBaseFetchError } from '@/app/types/error'
import type { IVerification } from './types/verification'
import { API } from '@/app/api'
import { apiSlice } from '@/app/apiSlice'

const verificationApiSlice = apiSlice.injectEndpoints({
	overrideExisting: false,
	endpoints: builder => ({
		getLastVerification: builder.query<{ data: IVerification }, string>({
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

		getVerificationByInstrumentId: builder.query<{ data: IVerification[] }, string>({
			query: instrumentId => `${API.si.verification.all}/${instrumentId}`,
			providesTags: [{ type: 'Verification', id: 'ALL' }],
			onQueryStarted: (_arg, api) => {
				try {
					api.queryFulfilled
				} catch (error) {
					const fetchError = (error as IBaseFetchError).error
					toast.error(fetchError.data.message, { autoClose: false })
				}
			},
		}),

		createVerification: builder.mutation<string, IVerification>({
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

		updateVerification: builder.mutation<string, IVerification>({
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
