import { PageBox } from '@/styled/PageBox'
import { DataTable } from '@/features/dataTable/components/DataTable'
import { Modal } from '@/features/modal/components/Modal'

export default function Home() {
	return (
		<PageBox>
			<DataTable />
			<Modal />
		</PageBox>
	)
}
