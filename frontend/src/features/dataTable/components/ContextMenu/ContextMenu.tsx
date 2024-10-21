import { FC } from 'react'
import { ListItemIcon, Menu, MenuItem } from '@mui/material'

import type { Coordinates } from '@/features/dataTable/hooks/useContextMenu'
import type { Status } from '../../types/data'
import { useAppDispatch } from '@/hooks/redux'
import { PermRules } from '@/constants/permissions'
import { useModal } from '@/features/modal/hooks/useModal'
import { useCheckPermission } from '@/features/auth/hooks/check'
import { ModalSelectors } from '@/features/modal/modalSlice'
import { setActive } from '@/features/dataTable/dataTableSlice'
import { EditIcon } from '@/components/Icons/EditIcon'
import { VerifyIcon } from '@/components/Icons/VerifyIcon'
import { ExchangeIcon } from '@/components/Icons/ExchangeIcon'
import { CopyIcon } from '@/components/Icons/CopyIcon'
import { LocHistoryIcon } from '@/components/Icons/LocHistoryIcon'
import { VerHistoryIcon } from '@/components/Icons/VerHistoryIcon'
import { UploadIcon } from '@/components/Icons/UploadIcon'
import { CancelMove } from './CancelMove'

type Props = {
	coordinates?: Coordinates
	isSelected: boolean
	itemId?: string
	status: Status
	positionHandler: (coordinates?: Coordinates, itemId?: string, status?: Status, isSelected?: boolean) => void
}

export const ContextMenu: FC<Props> = ({ coordinates, itemId, status, positionHandler }) => {
	const { openModal } = useModal()

	const dispatch = useAppDispatch()

	const closeHandler = () => {
		positionHandler()
	}

	const contextHandler = (selector: ModalSelectors) => () => {
		if (itemId) {
			dispatch(setActive({ id: itemId, status }))
			closeHandler()
			openModal(selector)
		}
	}

	const SiMenuItemsWriter = [
		<MenuItem key='create' onClick={contextHandler('CreateDataItem')}>
			<ListItemIcon>
				<CopyIcon fontSize={18} fill={'#757575'} />
			</ListItemIcon>
			Создать на основании
		</MenuItem>,
		<MenuItem key='edit' onClick={contextHandler('EditDataItem')}>
			<ListItemIcon>
				<EditIcon fontSize={16} fill={'#757575'} />
			</ListItemIcon>
			Редактировать
		</MenuItem>,
		// <MenuItem key='testEdit' onClick={contextHandler('Test')}>
		// 	<ListItemIcon>
		// 		<EditIcon fontSize={16} fill={'#757575'} />
		// 	</ListItemIcon>
		// 	Тестирование
		// </MenuItem>,
	]
	const VerificationMenuItem = [
		<MenuItem key='verification' onClick={contextHandler('NewVerification')}>
			<ListItemIcon>
				<VerifyIcon fontSize={18} fill={'#757575'} />
			</ListItemIcon>
			Добавить поверку
		</MenuItem>,
	]
	const LocMenuItems = [
		<MenuItem key='location' disabled={status == 'moved'} onClick={contextHandler('NewLocation')}>
			<ListItemIcon>
				<ExchangeIcon fontSize={18} fill={'#757575'} />
			</ListItemIcon>
			Добавить перемещение
		</MenuItem>,
		<CancelMove key='cancel-location' itemId={itemId} onClick={contextHandler('DeleteLocation')} />,
	]

	const ResMenuItems = [
		<MenuItem key='location' disabled={status == 'moved'} onClick={contextHandler('SendToReserve')}>
			<ListItemIcon>
				<ExchangeIcon fontSize={18} fill={'#757575'} />
			</ListItemIcon>
			Вернуть инструмент
		</MenuItem>,
		<CancelMove key='cancel-location' itemId={itemId} onClick={contextHandler('DeleteLocation')} />,
	]

	const DocumentMenuItem = [
		<MenuItem key='documents' onClick={contextHandler('Documents')}>
			<ListItemIcon>
				<UploadIcon fontSize={18} color={'#757575'} />
			</ListItemIcon>
			Добавить документ к поверке
		</MenuItem>,
	]

	const VerWrite = useCheckPermission(PermRules.Verification.Write)
	const DocWrite = useCheckPermission(PermRules.Documents.Write)

	return (
		<Menu
			open={Boolean(coordinates)}
			onClose={closeHandler}
			anchorReference='anchorPosition'
			anchorPosition={coordinates ? { top: coordinates.mouseY, left: coordinates.mouseX } : undefined}
		>
			{useCheckPermission(PermRules.SI.Write) ? SiMenuItemsWriter : null}
			{useCheckPermission(PermRules.Verification.Write) ? VerificationMenuItem : null}
			{useCheckPermission(PermRules.Location.Write) ? LocMenuItems : null}
			{useCheckPermission(PermRules.Reserve.Write) ? ResMenuItems : null}
			{!VerWrite && DocWrite ? DocumentMenuItem : null}

			<MenuItem onClick={contextHandler('ViewVerificationHistory')}>
				<ListItemIcon>
					<VerHistoryIcon fontSize={20} fill={'#363636'} />
				</ListItemIcon>
				История поверок
			</MenuItem>

			<MenuItem onClick={contextHandler('ViewLocationHistory')}>
				<ListItemIcon>
					<LocHistoryIcon fontSize={22} fill={'#363636'} />
				</ListItemIcon>
				История перемещений
			</MenuItem>
		</Menu>
	)
}
