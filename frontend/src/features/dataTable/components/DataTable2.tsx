import { lazy, Suspense } from 'react'
import { Box } from '@mui/material'

import { DataHeader } from './DataHeader'
import { DataFooter } from './DataFooter'
import { Fallback } from '@/components/Fallback/Fallback'

const Table = lazy(() => import('./Table/Table'))

// type Props = {
// 	status?: SIStatus
// }

export default function DataTable() {
	return (
		<Box
			borderRadius={3}
			padding={2}
			width={'100%'}
			border={'1px solid rgba(0, 0, 0, 0.12)'}
			// flexGrow={1}
			// maxHeight={820}
			display={'flex'}
			flexDirection={'column'}
			sx={{ backgroundColor: '#fff', userSelect: 'none' }}
		>
			<DataHeader />

			<Suspense fallback={<Fallback />}>
				<Table />
			</Suspense>

			<DataFooter />
		</Box>
	)
}
