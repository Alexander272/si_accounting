import { useRef, useState } from 'react'
import { IconButton, Menu, MenuItem, useTheme } from '@mui/material'

import type { SIStatus } from '../../types/data'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { LeftArrowIcon } from '@/components/Icons/LeftArrowIcon'
import { getSIStatus, setPage, setStatus } from '../../dataTableSlice'

export const SelectSIList = () => {
	const status = useAppSelector(getSIStatus)
	const { palette } = useTheme()

	const anchor = useRef<HTMLButtonElement>(null)
	const [open, setOpen] = useState(false)

	const dispatch = useAppDispatch()

	const toggleHandler = () => setOpen(prev => !prev)

	const changeListHandler = (status: SIStatus) => () => {
		dispatch(setStatus(status))
		dispatch(setPage(1))
		toggleHandler()
	}

	return (
		<>
			<IconButton ref={anchor} onClick={toggleHandler}>
				<LeftArrowIcon fontSize={16} fill={palette.primary.main} transform={'rotate(-90deg)'} />
			</IconButton>

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
							// mt: 1.5,
							// paddingX: 2,
							// paddingBottom: 2,
							'&:before': {
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
				<MenuItem selected={!status || status == 'work'} onClick={changeListHandler('work')}>
					Основные
				</MenuItem>
				<MenuItem selected={status == 'repair'} onClick={changeListHandler('repair')}>
					На ремонте
				</MenuItem>
				<MenuItem selected={status == 'decommissioning'} onClick={changeListHandler('decommissioning')}>
					Списанные
				</MenuItem>
			</Menu>
		</>
	)
}
