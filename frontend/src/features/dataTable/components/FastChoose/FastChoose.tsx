import { useRef, useState } from 'react'
import { Button, ListItemIcon, Menu, MenuItem } from '@mui/material'

import { CheckListIcon } from '@/components/Icons/CheckListIcon'
import { useAppSelector } from '@/hooks/redux'
import { getSelectedItems } from '../../dataTableSlice'

export const FastChoose = () => {
	const anchor = useRef<HTMLButtonElement | null>(null)
	const [open, setOpen] = useState(false)

	const selected = useAppSelector(getSelectedItems)

	const toggleHandler = () => setOpen(prev => !prev)

	// const allHandler = ()=> {}

	//TODO можно сделать выбор всех позиций, просроченных или всех за определенный месяц и кнопочку для отмены выбора
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
				<CheckListIcon fontSize={16} mr={1} />
				Выбрать
			</Button>

			<Menu
				open={open}
				onClose={toggleHandler}
				anchorEl={anchor.current}
				transformOrigin={{ horizontal: 'center', vertical: 'top' }}
				anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
				MenuListProps={{ role: 'listbox', disableListWrap: false }}
				slotProps={{
					paper: {
						elevation: 0,
						sx: {
							overflow: 'visible',
							filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
							mt: 1.5,
							maxWidth: 300,
							width: '100%',
							':before': {
								content: '""',
								display: 'block',
								position: 'absolute',
								top: 0,
								left: '50%',
								width: 10,
								height: 10,
								bgcolor: 'background.paper',
								transform: 'translate(-50%, -50%) rotate(45deg)',
								zIndex: 0,
							},
						},
					},
				}}
			>
				{/* //TODO решить как выбирать элементы и что делать если не все элементы которые должны быть выбраны влазят на одну страницу */}
				<MenuItem>
					<ListItemIcon>IC</ListItemIcon>
					{selected.length ? 'Отменить выбор' : 'Выбрать все'}
				</MenuItem>
				<MenuItem>
					<ListItemIcon>IC</ListItemIcon>
					Все просроченные
				</MenuItem>
				<MenuItem>
					<ListItemIcon>IC</ListItemIcon>
					Все за текущий месяц
				</MenuItem>
			</Menu>
		</>
	)
}
