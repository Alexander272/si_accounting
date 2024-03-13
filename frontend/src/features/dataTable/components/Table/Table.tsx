import { FC } from 'react'
import { Box, LinearProgress, Stack } from '@mui/material'

import { Body } from './Body/Body'
import { Header } from './Head/Header'
import { ContextMenu } from '../ContextMenu/ContextMenu'
import { useContextMenu } from '../../hooks/useContextMenu'

type Props = {
	loading?: boolean
	height?: number
	itemSize?: number
	itemCount?: number
}

//TODO по хорошему всякие обработчики кликов и подобного надо передавать снаружи. контекстное меню тоже должно зависеть от таблицы
export const Table: FC<Props> = ({ loading }) => {
	const { coordinates, isSelected, itemId, status, positionHandler } = useContextMenu()

	return (
		<Stack sx={{ maxWidth: '100%', overflowY: 'hidden', overflowX: 'auto', position: 'relative' }}>
			<Header />

			{loading && (
				<Box width={'100%'} marginY={'-2px'} height={4}>
					<LinearProgress />
				</Box>
			)}
			{/* //TODO из-за того что я прокидываю функцию (насколько я понимаю) при клике все таблица перерисовывается */}
			<Body itemId={itemId} positionHandler={positionHandler} />

			<ContextMenu
				coordinates={coordinates}
				isSelected={isSelected}
				itemId={itemId}
				status={status}
				positionHandler={positionHandler}
			/>
		</Stack>
	)
}
