import { useRef, useState } from 'react'
import { Button, ListItemIcon, Menu, MenuItem } from '@mui/material'
import { toast } from 'react-toastify'

import { useModal } from '@/features/modal/hooks/useModal'
import type { ModalSelectors } from '@/features/modal/modalSlice'
import { useAppSelector } from '@/hooks/redux'
import { getSelectedItems } from '../../dataTableSlice'
import { VerifyIcon } from '@/components/Icons/VerifyIcon'
import { ExchangeIcon } from '@/components/Icons/ExchangeIcon'
import { FileDownloadIcon } from '@/components/Icons/FileDownloadIcon'

export const Tools = () => {
	const anchor = useRef<HTMLButtonElement>(null)
	const [open, setOpen] = useState(false)
	const { openModal } = useModal()

	const selected = useAppSelector(getSelectedItems)

	const toggleHandler = () => setOpen(prev => !prev)

	// const verificationHandler = () => {
	// 	toggleHandler()
	// 	if (!selected.length) toast.error('Инструменты не выбраны')
	// 	else openModal('NewVerification')
	// }

	const modalHandler = (selector: ModalSelectors) => () => {
		toggleHandler()
		if (!selected.length) toast.error('Инструменты не выбраны')
		else openModal(selector)
	}

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
				<MenuItem onClick={modalHandler('ChangeLocation')}>
					<ListItemIcon>
						<ExchangeIcon fontSize={18} fill={'#757575'} />
					</ListItemIcon>
					Добавить перемещение
				</MenuItem>

				<MenuItem onClick={modalHandler('NewVerification')}>
					<ListItemIcon>
						<VerifyIcon fontSize={18} fill={'#757575'} />
					</ListItemIcon>
					Добавить поверку
				</MenuItem>

				<MenuItem>
					<ListItemIcon>
						<FileDownloadIcon fontSize={20} fill={'#757575'} />
					</ListItemIcon>
					Создать график поверки
				</MenuItem>
				{/* //TODO возможно надо будет выгружать в excel таблицу которая выводится на экран */}
			</Menu>
		</>
	)
}
