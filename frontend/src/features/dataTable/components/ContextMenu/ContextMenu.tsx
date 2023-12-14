import { FC } from 'react'
import { ListItemIcon, Menu, MenuItem } from '@mui/material'

import type { Coordinates } from '../../hooks/useContextMenu'
import { useAppDispatch } from '@/hooks/redux'
import { setActive } from '../../dataTableSlice'
import { useModal } from '@/features/modal/hooks/useModal'
import { ModalSelectors } from '@/features/modal/modalSlice'
import { EditIcon } from '@/components/Icons/EditIcon'
import { VerifyIcon } from '@/components/Icons/VerifyIcon'
import { ExchangeIcon } from '@/components/Icons/ExchangeIcon'

type Props = {
	coordinates?: Coordinates
	isSelected: boolean
	itemId?: string
	positionHandler: (coordinates?: Coordinates, itemId?: string, isSelected?: boolean) => void
}

export const ContextMenu: FC<Props> = ({ coordinates, itemId, positionHandler }) => {
	const { openModal } = useModal()

	const dispatch = useAppDispatch()

	const closeHandler = () => {
		positionHandler()
	}

	const contextHandler = (selector: ModalSelectors) => () => {
		if (itemId) {
			dispatch(setActive(itemId))
			closeHandler()
			openModal(selector)
		}
	}

	return (
		<Menu
			open={Boolean(coordinates)}
			onClose={closeHandler}
			anchorReference='anchorPosition'
			anchorPosition={coordinates ? { top: coordinates.mouseY, left: coordinates.mouseX } : undefined}
		>
			<MenuItem onClick={contextHandler('EditInstrument')}>
				<ListItemIcon>
					<EditIcon fontSize={16} fill={'#757575'} />
				</ListItemIcon>
				Редактировать
			</MenuItem>

			<MenuItem onClick={contextHandler('NewVerification')}>
				<ListItemIcon>
					<VerifyIcon fontSize={18} fill={'#757575'} />
				</ListItemIcon>
				Добавить поверку
			</MenuItem>

			<MenuItem onClick={contextHandler('ChangeLocation')}>
				<ListItemIcon>
					<ExchangeIcon fontSize={18} fill={'#757575'} />
				</ListItemIcon>
				Добавить перемещение
			</MenuItem>
		</Menu>
	)
}
