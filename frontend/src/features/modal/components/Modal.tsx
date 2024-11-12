import { forwardRef } from 'react'
import { Dialog, DialogContent, DialogTitle, IconButton, Slide, Stack } from '@mui/material'
import type { TransitionProps } from '@mui/material/transitions'

import { useAppSelector } from '@/hooks/redux'
import { ModalTitles } from '@/constants/modalTitles'
// import { CreateSi } from '@/features/si/components/CreateSi'
import { LocalCreateSi } from '@/features/si/components/LocalCreateSi'
import { UpdateSi } from '@/features/si/components/UpdateSi'
import { CreateVerification } from '@/features/verification/components/CreateVerification'
import { CreateSeveralVerification } from '@/features/verification/components/CreateSeveralVerification'
import { CreateLocation } from '@/features/location/components/CreateLocation'
import { CreateSeveralLocation } from '@/features/location/components/CreateSeveralLocation'
import { SendToReserve } from '@/features/location/components/SendToReserve'
import { LocationHistory } from '@/features/location/components/LocationHistory'
import { VerificationHistory } from '@/features/verification/components/VerificationHistory'
import { Schedule } from '@/features/dataTable/components/Schedule/Schedule'
import { DeleteLocation } from '@/features/location/components/DeleteLocation'
import { DocumentsForm } from '@/features/files/components/Form/Form'
import { ReceivingForm } from '@/features/location/components/ReceivingForm'
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
					{selector == 'EditDataItem' && ModalTitles.EDIT_ITEM}
					{selector == 'NewVerification' && ModalTitles.NEW_VERIFICATION}
					{selector == 'SeveralVerifications' && ModalTitles.NEW_VERIFICATION}
					{selector == 'NewLocation' && ModalTitles.NEW_MOVEMENT}
					{selector == 'SeveralLocations' && ModalTitles.NEW_MOVEMENT}
					{selector == 'DeleteLocation' && ModalTitles.DEL_MOVEMENT}
					{selector == 'SendToReserve' && ModalTitles.SEND_TO_RESERVE}
					{selector == 'Receive' && ModalTitles.RECEIVE}

					{selector == 'EditEmployee' && ModalTitles.EDIT_EMPLOYEE}
					{selector == 'CreateEmployee' && ModalTitles.CREATE_EMPLOYEE}
					{selector == 'EditDepartment' && ModalTitles.EDIT_DEPARTMENT}
					{selector == 'CreateDepartment' && ModalTitles.CREATE_DEPARTMENT}

					{selector == 'ViewLocationHistory' && ModalTitles.MOVEMENT_HISTORY}
					{selector == 'ViewVerificationHistory' && ModalTitles.VERIFICATION_HISTORY}
					{selector == 'Documents' && ModalTitles.CREATE_DOCUMENT}

					{selector == 'Period' && ModalTitles.PERIOD}

					{selector == 'Test' && ModalTitles.EDIT_ITEM}
				</DialogTitle>

				<IconButton onClick={closeModal} sx={{ lineHeight: '16px', mr: 2 }}>
					&times;
				</IconButton>
			</Stack>
			<DialogContent sx={{ pt: 0 }}>
				{selector == 'CreateDataItem' && <LocalCreateSi />}
				{selector == 'EditDataItem' && <UpdateSi />}
				{selector == 'NewVerification' && <CreateVerification />}
				{selector == 'SeveralVerifications' && <CreateSeveralVerification />}
				{selector == 'NewLocation' && <CreateLocation />}
				{selector == 'SeveralLocations' && <CreateSeveralLocation />}
				{selector == 'DeleteLocation' && <DeleteLocation />}
				{selector == 'SendToReserve' && <SendToReserve />}
				{selector == 'Receive' && <ReceivingForm />}

				{selector == 'ViewLocationHistory' && <LocationHistory />}
				{selector == 'ViewVerificationHistory' && <VerificationHistory />}
				{selector == 'Documents' && <DocumentsForm />}

				{selector == 'Period' && <Schedule />}

				{selector == 'Test' && <CreateLocation />}
			</DialogContent>
		</Dialog>
	)
}
