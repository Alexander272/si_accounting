import { toast } from 'react-toastify'

import { API } from '@/app/api'
import { apiSlice } from '@/app/apiSlice'
import type { IBaseFetchError } from '@/app/types/error'
import type { IDepartment, IEmployee } from './types'

type Location = {
	id?: string
	instrumentId: string
	department: string
	person: string
	dateOfIssue: string
	dateOfReceiving: string
	status: string
}

const locationApiSlice = apiSlice.injectEndpoints({
	overrideExisting: false,
	endpoints: builder => ({
		getLastLocation: builder.query<{ data: Location }, string>({
			query: instrumentId => `${API.si.location.base}/${instrumentId}`,
			providesTags: [
				{ type: 'Location', id: 'LAST' },
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

		getDepartments: builder.query<{ data: IDepartment[] }, null>({
			query: () => `${API.departments}/all`,
			providesTags: [{ type: 'Departments', id: 'All' }],
			onQueryStarted: async (_arg, api) => {
				try {
					await api.queryFulfilled
				} catch (error) {
					const fetchError = (error as IBaseFetchError).error
					toast.error(fetchError.data.message, { autoClose: false })
				}
			},
		}),

		getEmployees: builder.query<{ data: IEmployee[] }, string>({
			query: departmentId => `${API.employees}/${departmentId}`,
			providesTags: (_result, _error, arg) => [{ type: 'Employees', id: arg }],
			onQueryStarted: async (_arg, api) => {
				try {
					await api.queryFulfilled
				} catch (error) {
					const fetchError = (error as IBaseFetchError).error
					toast.error(fetchError.data.message, { autoClose: false })
				}
			},
		}),

		createLocation: builder.mutation<string, Location>({
			query: data => ({
				url: API.si.location.base,
				method: 'POST',
				body: data,
			}),
			invalidatesTags: [{ type: 'SI', id: 'ALL' }],
		}),

		updateLocation: builder.mutation<string, Location>({
			query: data => ({
				url: `${API.si.location.base}/${data.id}`,
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: [{ type: 'Location', id: 'LAST' }],
		}),
	}),
})

export const {
	useGetLastLocationQuery,
	useGetDepartmentsQuery,
	useGetEmployeesQuery,
	useCreateLocationMutation,
	useUpdateLocationMutation,
} = locationApiSlice
