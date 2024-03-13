import { useCallback, useState } from 'react'

import type { Status } from '../types/data'

export type Coordinates = {
	mouseX: number
	mouseY: number
}

// export type Status = 'reserve' | 'used' | 'moved'

export const useContextMenu = () => {
	const [coordinates, setCoordinates] = useState<Coordinates>()
	const [itemId, setItemId] = useState<string>()
	const [status, setStatus] = useState<Status>('reserve')
	const [isSelected, setIsSelected] = useState(false)

	const positionHandler = useCallback(
		(coordinates?: Coordinates, itemId?: string, status: Status = 'reserve', isSelected: boolean = false) => {
			setCoordinates(coordinates)
			setItemId(itemId)
			setStatus(status)
			setIsSelected(isSelected)
		},
		[]
	)

	return { coordinates, itemId, isSelected, status, positionHandler }
}
