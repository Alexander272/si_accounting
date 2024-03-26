import { forwardRef } from 'react'
import { Dialog, DialogContent, DialogTitle, IconButton, Slide, Stack } from '@mui/material'
import type { TransitionProps } from '@mui/material/transitions'

import { useAppSelector } from '@/hooks/redux'
import { ModalTitles } from '@/constants/modalTitles'
import { CreateDataItem } from '@/components/Forms/CreateDataItem/CreateDataItem'
import { NewVerification } from '@/components/Forms/NewVerification/NewVerification'
import { UpdateInstrument } from '@/components/Forms/UpdateInstrument/UpdateInstrument'
import { ChangeLocation } from '@/components/Forms/ChangeLocation/ChangeLocation'
import { EmployeeForm } from '@/features/employees/components/EmployeeForm'
import { DepartmentForm } from '@/features/employees/components/DepartmentForm'
import { LocationHistory } from '@/features/location/LocationHistory'
import { VerificationHistory } from '@/features/verification/VerificationHistory'
import { useModal } from '../hooks/useModal'
import { getIsOpenModal, getModalSelector } from '../modalSlice'

const Transition = forwardRef(function Transition(
	props: TransitionProps & {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		children: React.ReactElement<any, any>
	},
	ref: React.Ref<unknown>
) {
	return <Slide direction='up' ref={ref} {...props} />
})

export const Modal = () => {
	const open = useAppSelector(getIsOpenModal)
	const selector = useAppSelector(getModalSelector)

	const { closeModal } = useModal()

	// TODO как-то все плохо сделано, надо поправить
	// к тому же делать одно модальное окно на все было не удачной идеей
	return (
		<Dialog
			open={open}
			onClose={closeModal}
			fullWidth
			maxWidth={selector == 'ViewVerificationHistory' ? 'lg' : 'md'}
			TransitionComponent={Transition}
		>
			<Stack direction={'row'} width={'100%'} justifyContent={'space-between'} alignItems={'center'}>
				<DialogTitle color={'primary'}>
					{selector == 'CreateDataItem' && ModalTitles.ADD_ITEM}
					{selector == 'NewVerification' && ModalTitles.NEW_VERIFICATION}
					{selector == 'EditInstrument' && ModalTitles.EDIT_ITEM}
					{selector == 'ChangeLocation' && ModalTitles.NEW_MOVEMENT}

					{selector == 'EditEmployee' && ModalTitles.EDIT_EMPLOYEE}
					{selector == 'CreateEmployee' && ModalTitles.CREATE_EMPLOYEE}
					{selector == 'EditDepartment' && ModalTitles.EDIT_DEPARTMENT}
					{selector == 'CreateDepartment' && ModalTitles.CREATE_DEPARTMENT}

					{selector == 'ViewLocationHistory' && ModalTitles.MOVEMENT_HISTORY}
					{selector == 'ViewVerificationHistory' && ModalTitles.VERIFICATION_HISTORY}
				</DialogTitle>

				<IconButton onClick={closeModal} sx={{ lineHeight: '16px', mr: 2 }}>
					&times;
				</IconButton>
			</Stack>
			<DialogContent sx={{ pt: 0 }}>
				{selector == 'CreateDataItem' && <CreateDataItem />}
				{selector == 'NewVerification' && <NewVerification />}
				{selector == 'EditInstrument' && <UpdateInstrument />}
				{selector == 'ChangeLocation' && <ChangeLocation />}

				{selector == 'EditEmployee' || selector == 'CreateEmployee' ? <EmployeeForm /> : null}
				{selector == 'EditDepartment' || selector == 'CreateDepartment' ? <DepartmentForm /> : null}

				{selector == 'ViewLocationHistory' && <LocationHistory />}
				{selector == 'ViewVerificationHistory' && <VerificationHistory />}
			</DialogContent>
		</Dialog>
	)
}
