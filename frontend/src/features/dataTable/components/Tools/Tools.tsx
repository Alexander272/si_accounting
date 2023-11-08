import { useRef, useState } from 'react'
import { Button, ListItemIcon, Menu, MenuItem } from '@mui/material'

import { useModal } from '@/features/modal/hooks/useModal'

export const Tools = () => {
	const anchor = useRef<HTMLButtonElement>(null)
	const [open, setOpen] = useState(false)
	const { openModal } = useModal()

	const toggleHandler = () => setOpen(prev => !prev)

	const verificationHandler = () => {
		toggleHandler()
		openModal('NewVerification')
	}

	return (
		<>
			<Button
				ref={anchor}
				onClick={toggleHandler}
				size='small'
				variant='outlined'
				color='inherit'
				sx={{ borderRadius: 3, paddingX: 1.5 }}
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
				<MenuItem>
					<ListItemIcon>IC</ListItemIcon> Добавить перемещение
				</MenuItem>
				<MenuItem onClick={verificationHandler}>
					<ListItemIcon>IC</ListItemIcon> Добавить поверку
				</MenuItem>
				<MenuItem>
					<ListItemIcon>IC</ListItemIcon> Создать график поверки
				</MenuItem>
				{/* // возможно надо будет выгружать в excel таблицы которая выводится на экран */}
			</Menu>
		</>
	)
}
