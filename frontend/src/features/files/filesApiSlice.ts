import { apiSlice } from '@/app/apiSlice'
import { HttpCodes } from '@/constants/httpCodes'

interface IUploadFiles {
	data: FormData
}

const filesApiSlice = apiSlice.injectEndpoints({
	overrideExisting: false,
	endpoints: builder => ({
		uploadFiles: builder.mutation<null, IUploadFiles>({
			//TODO прописать путь
			query: data => ({
				url: ``,
				method: 'POST',
				body: data,
				validateStatus: response => response.status === HttpCodes.CREATED,
			}),
		}),
	}),
})

export const { useUploadFilesMutation } = filesApiSlice
