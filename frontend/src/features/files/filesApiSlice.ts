import { toast } from 'react-toastify'

import type { IDocument } from './types/file'
import { HttpCodes } from '@/constants/httpCodes'
import { API } from '@/app/api'
import { apiSlice } from '@/app/apiSlice'
import { IBaseFetchError } from '@/app/types/error'
import { saveAs } from '@/utils/saveAs'

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
				url: `${API.si.documents.base}/list`,
				method: 'GET',
				params: new URLSearchParams({ instrumentId: req.instrumentId, verificationId: req.verificationId }),
			}),
			providesTags: [{ type: 'Verification', id: 'documents' }],
		}),
		downloadFile: builder.query<null, IDocument>({
			queryFn: async (doc, _api, _, baseQuery) => {
				const result = await baseQuery({
					url: API.si.documents.base,
					params: new URLSearchParams({ path: doc.path }),
					cache: 'no-cache',
					responseHandler: response => (response.status === HttpCodes.OK ? response.blob() : response.json()),
				})

				if (result.error) {
					console.log(result.error)

					const fetchError = (result.error.data as IBaseFetchError).error
					toast.error(fetchError.data.message, { autoClose: false })
				}

				if (result.data instanceof Blob) saveAs(result.data, doc.label)
				return { data: null }
			},
		}),
		uploadFiles: builder.mutation<null, IUploadFiles>({
			query: data => ({
				url: `${API.si.documents.base}`,
				method: 'POST',
				body: data.data,
				validateStatus: response => response.status === HttpCodes.CREATED,
			}),
			invalidatesTags: [{ type: 'Verification', id: 'documents' }],
		}),
		deleteFile: builder.mutation<null, DeleteDocuments>({
			query: data => ({
				url: `${API.si.documents.base}/${data.id}`,
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

export const { useGetFileListQuery, useUploadFilesMutation, useLazyDownloadFileQuery, useDeleteFileMutation } =
	filesApiSlice
