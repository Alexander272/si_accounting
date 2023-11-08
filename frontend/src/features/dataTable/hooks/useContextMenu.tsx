import { useState } from 'react'

export type Coordinates = {
	mouseX: number
	mouseY: number
}

export const useContextMenu = () => {
	const [coordinates, setCoordinates] = useState<Coordinates>()
	const [itemId, setItemId] = useState<string>()
	const [isSelected, setIsSelected] = useState(false)

	const positionHandler = (coordinates?: Coordinates, itemId?: string, isSelected: boolean = false) => {
		setCoordinates(coordinates)
		setItemId(itemId)
		setIsSelected(isSelected)

		console.log('hook', coordinates)
	}

	return { coordinates, itemId, isSelected, positionHandler }
}
