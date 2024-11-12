import { useAppSelector } from '@/hooks/redux'
import { getSIStatus, getTableFilter, getTablePage, getTableSize, getTableSort } from '../dataTableSlice'
import { useGetAllSIQuery } from '../siApiSlice'
import { useCheckPermission } from '@/features/auth/hooks/check'
import { PermRules } from '@/constants/permissions'

export const useGetAllSI = () => {
	const status = useAppSelector(getSIStatus)

	const page = useAppSelector(getTablePage)
	const size = useAppSelector(getTableSize)

	const sort = useAppSelector(getTableSort)
	const filter = useAppSelector(getTableFilter)

	const all = useCheckPermission(PermRules.SI.Write)

	const query = useGetAllSIQuery(
		{ status, page, size, all, sort, filter },
		{ pollingInterval: 5 * 60000, skipPollingIfUnfocused: true /*refetchOnFocus: true*/ }
	)

	return query
}
