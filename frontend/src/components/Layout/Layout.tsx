import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Box } from '@mui/material'

import { Fallback } from '@/components/Fallback/Fallback'
import { LayoutHeader } from './LayoutHeader'

export const Layout = () => {
	const location = useLocation()

	return (
		<Box minHeight='100vh' height='100vh' display='flex' flexDirection='column' pb={4}>
			<LayoutHeader />
			<Suspense key={location.key} fallback={<Fallback />}>
				<Outlet />
			</Suspense>
		</Box>
	)
}

export default Layout
