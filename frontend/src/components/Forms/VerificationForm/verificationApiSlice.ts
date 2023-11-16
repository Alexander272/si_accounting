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
		// createVerification: builder.mutation<string, FormData>({
		// 	query: data => ({
		// 		url: API.si.verification.base,
		// 		method: 'POST',
		// 		body: data,
		// 	}),
		// 	invalidatesTags: [
		// 		{ type: 'Verification', id: 'LAST' },
		// 		{ type: 'SI', id: 'ALL' },
		// 	],
		// }),

		updateVerification: builder.mutation<string, Verification>({
			query: data => ({
				url: `${API.si.verification.base}/${data.id}`,
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: [{ type: 'Verification', id: 'LAST' }],
		}),
	}),
})

export const { useGetLastVerificationQuery, useCreateVerificationMutation, useUpdateVerificationMutation } =
	verificationApiSlice
