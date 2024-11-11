import { toast } from 'react-toastify'

import type { IBaseFetchError } from '@/app/types/error'
import type { IDepartment } from './types/departments'
import { apiSlice } from '@/app/apiSlice'
import { API } from '@/app/api'

export const departmentApiSlice = apiSlice.injectEndpoints({
	overrideExisting: false,
	endpoints: builder => ({
		getDepartments: builder.query<{ data: IDepartment[] }, null>({
			query: () => `${API.departments}`,
			providesTags: [{ type: 'Departments', id: 'all' }],
			onQueryStarted: async (_arg, api) => {
				try {
					await api.queryFulfilled
				} catch (error) {
					const fetchError = (error as IBaseFetchError).error
					toast.error(fetchError.data.message, { autoClose: false })
				}
			},
		}),

		getDepartmentsById: builder.query<{ data: IDepartment }, string>({
			query: id => `${API.departments}/${id}`,
			providesTags: [{ type: 'Departments', id: 'all' }],
			onQueryStarted: async (_arg, api) => {
				try {
					await api.queryFulfilled
				} catch (error) {
					const fetchError = (error as IBaseFetchError).error
					toast.error(fetchError.data.message, { autoClose: false })
				}
			},
		}),

		getDepartmentsByUser: builder.query<{ data: IDepartment[] }, null>({
			query: () => `${API.departments}/sso`,
			providesTags: [{ type: 'Departments', id: 'all' }],
			onQueryStarted: async (_arg, api) => {
				try {
					await api.queryFulfilled
				} catch (error) {
					const fetchError = (error as IBaseFetchError).error
					toast.error(fetchError.data.message, { autoClose: false })
				}
			},
		}),

		createDepartment: builder.mutation<{ id: string }, IDepartment>({
			query: data => ({
				url: `${API.departments}`,
				method: 'POST',
				body: data,
			}),
			invalidatesTags: [{ type: 'Departments', id: 'all' }],
		}),

		updateDepartment: builder.mutation<null, IDepartment>({
			query: data => ({
				url: `${API.departments}/${data.id}`,
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: [{ type: 'Departments', id: 'all' }],
		}),

		deleteDepartment: builder.mutation<null, string>({
			query: id => ({
				url: `${API.departments}/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: [{ type: 'Departments', id: 'all' }],
		}),
	}),
})

export const {
	useGetDepartmentsQuery,
	useGetDepartmentsByIdQuery,
	useGetDepartmentsByUserQuery,
	useCreateDepartmentMutation,
	useUpdateDepartmentMutation,
	useDeleteDepartmentMutation,
} = departmentApiSlice
