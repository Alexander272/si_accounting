import { EmployeesList } from '@/features/employees/components/EmployeesList'
import { Modal } from '@/features/modal/components/Modal'
import { PageBox } from '@/styled/PageBox'

// страница для управления работниками и департаментами
export default function Employees() {
	return (
		<PageBox>
			<EmployeesList />
			<Modal />
		</PageBox>
	)
}
