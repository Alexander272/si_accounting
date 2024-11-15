import { lazy, Suspense } from 'react'

import { PageBox } from '@/styled/PageBox'
import { Fallback } from '@/components/Fallback/Fallback'
// import { DataTable } from '@/features/dataTable/components/DataTable'
// import { DataTable2 } from '@/features/dataTable/components/DataTable'

const Table = lazy(() => import('@/features/dataTable/components/DataTable2'))
const Modal = lazy(() => import('@/features/modal/components/Modal'))

export default function Home() {
	return (
		<PageBox>
			{/* <DataTable /> */}
			{/* <DataTable2 /> */}
			<Suspense fallback={<Fallback />}>
				<Table />
			</Suspense>

			<Suspense>
				<Modal />
			</Suspense>
		</PageBox>
	)
}
