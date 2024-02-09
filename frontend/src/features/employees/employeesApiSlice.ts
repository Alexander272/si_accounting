import { toast } from 'react-toastify'

import type { IDepartment, IEmployee } from './types/employee'
import type { IBaseFetchError } from '@/app/types/error'
import { apiSlice } from '@/app/apiSlice'
import { API } from '@/app/api'

const employeesApiSlice = apiSlice.injectEndpoints({
	overrideExisting: false,
	endpoints: builder => ({
		getEmployees: builder.query<{ data: IEmployee[] }, string | null>({
			query: departmentId => ({
				url: `${API.employees}`,
				params: new URLSearchParams(departmentId ? { departmentId } : undefined),
			}),
			providesTags: (_result, _error, arg) => [{ type: 'Employees', id: arg || 'all' }],
			onQueryStarted: async (_arg, api) => {
				try {
					await api.queryFulfilled
				} catch (error) {
					const fetchError = (error as IBaseFetchError).error
					toast.error(fetchError.data.message, { autoClose: false })
				}
			},
		}),
		createEmployee: builder.mutation<null, IEmployee>({
			query: data => ({
				url: `${API.employees}`,
				method: 'POST',
				body: data,
			}),
			invalidatesTags: (_result, _error, arg) => [
				{ type: 'Employees', id: 'all' },
				{ type: 'Employees', id: arg.departmentId },
			],
		}),
		updateEmployee: builder.mutation<null, IEmployee>({
			query: data => ({
				url: `${API.employees}/${data.id}`,
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: (_result, _error, arg) => [
				{ type: 'Employees', id: 'all' },
				{ type: 'Employees', id: arg.departmentId },
			],
		}),
		deleteEmployee: builder.mutation<null, IEmployee>({
			query: data => ({
				url: `${API.employees}/${data.id}`,
				method: 'DELETE',
			}),
			invalidatesTags: (_result, _error, arg) => [
				{ type: 'Employees', id: 'all' },
				{ type: 'Employees', id: arg.departmentId },
			],
		}),

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
		createDepartment: builder.mutation<null, IDepartment>({
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
	useGetEmployeesQuery,
	useCreateEmployeeMutation,
	useUpdateEmployeeMutation,
	useDeleteEmployeeMutation,
	useGetDepartmentsQuery,
	useCreateDepartmentMutation,
	useUpdateDepartmentMutation,
	useDeleteDepartmentMutation,
} = employeesApiSlice
