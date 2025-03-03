import { useRef, useState } from 'react'
import { Button, ListItemIcon, Menu, MenuItem } from '@mui/material'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

import type { ModalSelectors } from '@/features/modal/modalSlice'
import { AppRoutes } from '@/constants/routes'
import { PermRules } from '@/constants/permissions'
import { useAppSelector } from '@/hooks/redux'
import { useModal } from '@/features/modal/hooks/useModal'
import { useCheckPermission } from '@/features/auth/hooks/check'
import { getSIStatus, getSelected, getTableFilter, getTableSort } from '@/features/dataTable/dataTableSlice'
import { getRealm } from '@/features/realms/realmSlice'
import { useLazyExportQuery } from '@/features/files/filesApiSlice'
import { VerifyIcon } from '@/components/Icons/VerifyIcon'
import { ExchangeIcon } from '@/components/Icons/ExchangeIcon'
import { FileDownloadIcon } from '@/components/Icons/FileDownloadIcon'
import { EditEmployeeIcon } from '@/components/Icons/EditEmployeeIcon'
import { DocumentCheckIcon } from '@/components/Icons/DocumentCheckIcon'
import { FileSyncIcon } from '@/components/Icons/FileSyncIcon'

export const Tools = () => {
	const anchor = useRef<HTMLButtonElement>(null)
	const [open, setOpen] = useState(false)
	const { openModal } = useModal()

	const navigate = useNavigate()

	const realm = useAppSelector(getRealm)
	const selected = useAppSelector(getSelected)

	const status = useAppSelector(getSIStatus)
	const sort = useAppSelector(getTableSort)
	const filter = useAppSelector(getTableFilter)
	const all = useCheckPermission(PermRules.SI.Write)

	const [exportData] = useLazyExportQuery()

	const toggleHandler = () => setOpen(prev => !prev)

	const modalHandler =
		(selector: ModalSelectors, notEmpty = true) =>
		() => {
			toggleHandler()
			if (selector != 'Receive' && notEmpty && !Object.keys(selected).length)
				toast.error('Инструменты не выбраны')
			else openModal(selector)
		}

	const linkHandler = (link: string) => () => {
		navigate(link)
	}

	const exportHandler = async () => {
		await exportData({ status, sort, filter, all })
		toggleHandler()
	}

	const LocMenuItems = [
		<MenuItem key='location' onClick={modalHandler('SeveralLocations')}>
			<ListItemIcon>
				<ExchangeIcon fontSize={18} fill={'#757575'} />
			</ListItemIcon>
			Добавить перемещение
		</MenuItem>,
		<MenuItem key='receive' onClick={modalHandler('Receive')}>
			<ListItemIcon>
				<FileSyncIcon fontSize={18} fill={'#757575'} />
			</ListItemIcon>
			Получить инструменты
		</MenuItem>,
	]
	const SIMenuItems = [
		<MenuItem key='verification' onClick={modalHandler('SeveralVerifications')}>
			<ListItemIcon>
				<VerifyIcon fontSize={18} fill={'#757575'} />
			</ListItemIcon>
			Добавить поверку
		</MenuItem>,
		<MenuItem
			key='departments'
			onClick={linkHandler(realm?.locationType == 'department' ? AppRoutes.EMPLOYEES : AppRoutes.PLACES)}
		>
			<ListItemIcon>
				<EditEmployeeIcon fontSize={18} fill={'#757575'} />
			</ListItemIcon>
			Редактировать {realm?.locationType == 'department' ? 'подразделения' : 'места'}
		</MenuItem>,
		<MenuItem key='export' onClick={exportHandler}>
			<ListItemIcon>
				<FileDownloadIcon fontSize={20} fill={'#757575'} />
			</ListItemIcon>
			Экспортировать
		</MenuItem>,
		<MenuItem key='graph' onClick={modalHandler('Period', false)}>
			<ListItemIcon>
				<DocumentCheckIcon fontSize={20} fill={'#757575'} />
			</ListItemIcon>
			Создать график поверки
		</MenuItem>,
	]
	const ResMenuItems = [
		<MenuItem key='location' onClick={modalHandler('SendToReserve')}>
			<ListItemIcon>
				<ExchangeIcon fontSize={18} fill={'#757575'} />
			</ListItemIcon>
			Вернуть инструменты
		</MenuItem>,
		<MenuItem key='receive' onClick={modalHandler('Receive')}>
			<ListItemIcon>
				<FileSyncIcon fontSize={18} fill={'#757575'} />
			</ListItemIcon>
			Получить инструменты
		</MenuItem>,
		<MenuItem key='export' onClick={exportHandler}>
			<ListItemIcon>
				<FileDownloadIcon fontSize={20} fill={'#757575'} />
			</ListItemIcon>
			Экспортировать
		</MenuItem>,
	]

	return (
		<>
			<Button
				ref={anchor}
				onClick={toggleHandler}
				size='small'
				variant='outlined'
				color='inherit'
				sx={{ paddingX: 1.5 }}
			>
				Инструменты
			</Button>

			<Menu
				open={open}
				onClose={toggleHandler}
				anchorEl={anchor.current}
				transformOrigin={{ horizontal: 'center', vertical: 'top' }}
				anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
				MenuListProps={{
					role: 'listbox',
					disableListWrap: true,
				}}
				slotProps={{
					paper: {
						elevation: 0,
						sx: {
							overflow: 'visible',
							filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
							mt: 1.5,
							// paddingX: 2,
							maxWidth: 300,
							width: '100%',
							'&:before': {
								content: '""',
								display: 'block',
								position: 'absolute',
								top: 0,
								left: '60%',
								width: 10,
								height: 10,
								bgcolor: 'background.paper',
								transform: 'translate(-60%, -50%) rotate(45deg)',
								zIndex: 0,
							},
						},
					},
				}}
			>
				{useCheckPermission(PermRules.Location.Write) ? LocMenuItems : null}
				{useCheckPermission(PermRules.SI.Write) ? SIMenuItems : null}
				{useCheckPermission(PermRules.Reserve.Write) ? ResMenuItems : null}
			</Menu>
		</>
	)
}
