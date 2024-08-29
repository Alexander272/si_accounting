import { toast } from 'react-toastify'
import dayjs from 'dayjs'

import type { IPeriodForm } from '@/components/Forms/PeriodForm/type'
import type { ISIParams } from '../dataTable/types/data'
import type { IDocument } from './types/file'
import { HttpCodes } from '@/constants/httpCodes'
import { API } from '@/app/api'
import { apiSlice } from '@/app/apiSlice'
import { IBaseFetchError, IFetchError } from '@/app/types/error'
import { saveAs } from '@/utils/saveAs'
import { buildSiUrlParams } from '@/utils/buildUrlParams'

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
			onQueryStarted: async (_arg, api) => {
				try {
					await api.queryFulfilled
				} catch (error) {
					const fetchError = (error as IBaseFetchError).error
					toast.error(fetchError.data.message, { autoClose: false })
				}
			},
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
					const fetchError = result.error as IFetchError
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
			onQueryStarted: async (_arg, api) => {
				try {
					await api.queryFulfilled
				} catch (error) {
					console.log(error)
					const fetchError = (error as IBaseFetchError).error
					toast.error(fetchError.data.message, { autoClose: false })
				}
			},
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
			onQueryStarted: async (_arg, api) => {
				try {
					await api.queryFulfilled
				} catch (error) {
					console.log(error)
					const fetchError = (error as IBaseFetchError).error
					toast.error(fetchError.data.message, { autoClose: false })
				}
			},
		}),

		export: builder.query<null, ISIParams>({
			queryFn: async (params, _api, _, baseQuery) => {
				const filename = `Список инструментов от ${dayjs().format('DD-MM-YYYY')}.xlsx`
				const result = await baseQuery({
					url: API.si.export,
					params: buildSiUrlParams(params),
					cache: 'no-cache',
					responseHandler: response => (response.status === HttpCodes.OK ? response.blob() : response.json()),
				})

				if (result.error) {
					console.log(result.error)
					const fetchError = (result.error.data as IBaseFetchError).error
					toast.error(fetchError.data.message, { autoClose: false })
				}

				if (result.data instanceof Blob) saveAs(result.data, filename)
				return { data: null }
			},
		}),
		getVerificationSchedule: builder.query<null, IPeriodForm>({
			queryFn: async (params, _api, _, baseQuery) => {
				const filename = `График поверки от ${dayjs().format('DD-MM-YYYY')}.xlsx`
				const result = await baseQuery({
					url: API.si.schedule,
					params: new URLSearchParams({
						'period[gte]': params.gte.toString(),
						'period[lte]': params.lte.toString(),
					}),
					cache: 'no-cache',
					responseHandler: response => (response.status === HttpCodes.OK ? response.blob() : response.json()),
				})

				if (result.error) {
					console.log(result.error)
					const fetchError = (result.error.data as IBaseFetchError).error
					toast.error(fetchError.data.message, { autoClose: false })
				}

				if (result.data instanceof Blob) saveAs(result.data, filename)
				return { data: null }
			},
		}),
	}),
})

export const {
	useGetFileListQuery,
	useUploadFilesMutation,
	useLazyDownloadFileQuery,
	useDeleteFileMutation,
	useLazyExportQuery,
	useLazyGetVerificationScheduleQuery,
} = filesApiSlice
