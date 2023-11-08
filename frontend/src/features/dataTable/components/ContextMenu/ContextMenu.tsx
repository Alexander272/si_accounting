import { FC, useEffect } from 'react'
import { ListItemIcon, Menu, MenuItem } from '@mui/material'

import { type Coordinates } from '../../hooks/useContextMenu'

type Props = {
	coordinates?: Coordinates
	isSelected: boolean
	itemId?: string
	positionHandler: (coordinates?: Coordinates, itemId?: string, isSelected?: boolean) => void
}

export const ContextMenu: FC<Props> = ({ coordinates, positionHandler }) => {
	// const { position, isSelected, itemId, positionHandler } = useContextMenu()

	const closeHandler = () => {
		positionHandler()
	}

	useEffect(() => {
		console.log(coordinates)
	}, [coordinates])

	return (
		<Menu
			open={Boolean(coordinates)}
			onClose={closeHandler}
			anchorReference='anchorPosition'
			anchorPosition={coordinates ? { top: coordinates.mouseY, left: coordinates.mouseX } : undefined}
		>
			<MenuItem>
				<ListItemIcon>IC</ListItemIcon> Добавить поверку
			</MenuItem>
		</Menu>
	)
}
