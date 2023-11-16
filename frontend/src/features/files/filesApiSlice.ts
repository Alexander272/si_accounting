import { API } from '@/app/api'
import { apiSlice } from '@/app/apiSlice'
import { HttpCodes } from '@/constants/httpCodes'
import { IDocument } from './types/file'

type GetDocuments = {
	verificationId: string
	instrumentId: string
}

interface IUploadFiles {
	verificationId: string
	data: FormData
}

type DeleteDocuments = {
	verificationId: string
	instrumentId: string
	id: string
	filename: string
}

const filesApiSlice = apiSlice.injectEndpoints({
	overrideExisting: false,
	endpoints: builder => ({
		getFileList: builder.query<{ data: IDocument[] }, GetDocuments>({
			query: req => ({
				url: `${API.si.verification.base}/documents/list`,
				method: 'GET',
				params: new URLSearchParams({ instrumentId: req.instrumentId, verificationId: req.verificationId }),
			}),
			providesTags: [{ type: 'Verification', id: 'documents' }],
		}),
		uploadFiles: builder.mutation<null, IUploadFiles>({
			query: data => ({
				url: `${API.si.verification.base}/documents`,
				method: 'POST',
				body: data.data,
				validateStatus: response => response.status === HttpCodes.CREATED,
			}),
			invalidatesTags: [{ type: 'Verification', id: 'documents' }],
		}),
		deleteFile: builder.mutation<null, DeleteDocuments>({
			query: data => ({
				url: `${API.si.verification.base}/documents/${data.id}`,
				method: 'DELETE',
				params: new URLSearchParams({
					instrumentId: data.instrumentId,
					verificationId: data.verificationId,
					filename: data.filename,
				}),
			}),
			invalidatesTags: [{ type: 'Verification', id: 'documents' }],
		}),
	}),
})

export const { useGetFileListQuery, useUploadFilesMutation, useDeleteFileMutation } = filesApiSlice
