import { FC } from 'react'
import { ListItemIcon, Menu, MenuItem } from '@mui/material'

import type { Coordinates } from '@/features/dataTable/hooks/useContextMenu'
import type { Status } from '../../types/data'
import { useAppDispatch } from '@/hooks/redux'
import { PermRules } from '@/constants/permissions'
import { useModal } from '@/features/modal/hooks/useModal'
import { ModalSelectors } from '@/features/modal/modalSlice'
import { setActive } from '@/features/dataTable/dataTableSlice'
import { useCheckPermission } from '@/features/auth/hooks/check'
import { EditIcon } from '@/components/Icons/EditIcon'
import { VerifyIcon } from '@/components/Icons/VerifyIcon'
import { ExchangeIcon } from '@/components/Icons/ExchangeIcon'
import { CopyIcon } from '@/components/Icons/CopyIcon'

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

	const menuItems = [
		<MenuItem key='create' onClick={contextHandler('CreateDataItem')}>
			<ListItemIcon>
				<CopyIcon fontSize={18} fill={'#757575'} />
			</ListItemIcon>
			Создать на основании
		</MenuItem>,
		<MenuItem key='edit' onClick={contextHandler('EditInstrument')}>
			<ListItemIcon>
				<EditIcon fontSize={16} fill={'#757575'} />
			</ListItemIcon>
			Редактировать
		</MenuItem>,
		<MenuItem key='verification' onClick={contextHandler('NewVerification')}>
			<ListItemIcon>
				<VerifyIcon fontSize={18} fill={'#757575'} />
			</ListItemIcon>
			Добавить поверку
		</MenuItem>,
		<MenuItem key='location' disabled={status == 'moved'} onClick={contextHandler('ChangeLocation')}>
			<ListItemIcon>
				<ExchangeIcon fontSize={18} fill={'#757575'} />
			</ListItemIcon>
			Добавить перемещение
		</MenuItem>,
	]

	return (
		<Menu
			open={Boolean(coordinates)}
			onClose={closeHandler}
			anchorReference='anchorPosition'
			anchorPosition={coordinates ? { top: coordinates.mouseY, left: coordinates.mouseX } : undefined}
		>
			{useCheckPermission(PermRules.SI.Write) ? menuItems : null}

			<MenuItem disabled>
				<ListItemIcon>IC</ListItemIcon>История поверок
			</MenuItem>

			<MenuItem disabled>
				<ListItemIcon>IC</ListItemIcon>История перемещений
			</MenuItem>
		</Menu>
	)
}
