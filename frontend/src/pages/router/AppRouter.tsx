import { RouterProvider } from 'react-router-dom'

import { router } from './router'
import { useRefresh } from '@/features/auth/hooks/refresh'
import { Fallback } from '@/components/Fallback/Fallback'

export const AppRouter = () => {
	const { ready } = useRefresh()

	if (!ready) return <Fallback />

	return <RouterProvider router={router} />
}
