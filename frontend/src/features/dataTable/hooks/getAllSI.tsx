import { useAppSelector } from '@/hooks/redux'
import { getSIStatus, getTableFilter, getTablePage, getTableSize, getTableSort } from '../dataTableSlice'
import { useGetAllSIQuery } from '../siApiSlice'

export const useGetAllSI = () => {
	const status = useAppSelector(getSIStatus)

	const page = useAppSelector(getTablePage)
	const size = useAppSelector(getTableSize)

	const sort = useAppSelector(getTableSort)
	const filter = useAppSelector(getTableFilter)

	const query = useGetAllSIQuery(
		{ status, page, size, sort, filter },
		{ pollingInterval: 5 * 60000, skipPollingIfUnfocused: true, refetchOnFocus: true }
	)

	return query
}
