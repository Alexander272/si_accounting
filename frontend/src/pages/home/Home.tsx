import { PageBox } from '@/styled/PageBox'
// import { DataTable } from '@/features/dataTable/components/DataTable'
import { DataTable2 } from '@/features/dataTable/components/DataTable2'
import { Modal } from '@/features/modal/components/Modal'

export default function Home() {
	return (
		<PageBox>
			{/* <DataTable /> */}
			<DataTable2 />
			<Modal />
		</PageBox>
	)
}
