import { forwardRef } from 'react'
import { Dialog, DialogContent, DialogTitle, IconButton, Slide, Stack } from '@mui/material'
import type { TransitionProps } from '@mui/material/transitions'

import { useAppSelector } from '@/hooks/redux'
import { CreateDataItem } from '@/components/Forms/CreateDataItem/CreateDataItem'
import { NewVerification } from '@/components/Forms/NewVerification/NewVerification'
import { ModalTitles } from '@/constants/modalTitles'
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

	return (
		<Dialog open={open} onClose={closeModal} fullWidth maxWidth='md' TransitionComponent={Transition}>
			<Stack direction={'row'} width={'100%'} justifyContent={'space-between'} alignItems={'center'}>
				<DialogTitle color={'primary'}>
					{selector == 'CreateDataItem' && ModalTitles.ADD_ITEM}
					{selector == 'NewVerification' && ModalTitles.NEW_VERIFICATION}
				</DialogTitle>

				<IconButton onClick={closeModal} sx={{ lineHeight: '16px', mr: 2 }}>
					&times;
				</IconButton>
			</Stack>
			<DialogContent sx={{ pt: 0 }}>
				{selector == 'CreateDataItem' && <CreateDataItem />}
				{selector == 'NewVerification' && <NewVerification />}
			</DialogContent>
		</Dialog>
	)
}
