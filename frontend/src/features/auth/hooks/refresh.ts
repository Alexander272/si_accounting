import { useEffect, useState } from 'react'

import { useAppDispatch } from '@/hooks/redux'
import { setUser } from '@/features/user/userSlice'
import { useRefreshQuery } from '../authApiSlice'

export function useRefresh() {
	const [ready, setReady] = useState(false)

	const { data, isError } = useRefreshQuery(null)

	const dispatch = useAppDispatch()

	useEffect(() => {
		if (!isError && data) dispatch(setUser(data.data))
		setReady(true)
	}, [isError, data, dispatch])

	return { ready }
}
