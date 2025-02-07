import { Box, LinearProgress, Stack } from '@mui/material'

import { Body } from './Body/Body'
import { Header } from './Head/Header'
import { ContextMenu } from '../ContextMenu/ContextMenu'
import { useContextMenu } from '../../hooks/useContextMenu'
import { useGetAllSI } from '../../hooks/getAllSI'

// type Props = {
// 	loading?: boolean
// 	height?: number
// 	itemSize?: number
// 	itemCount?: number
// }

//TODO по хорошему всякие обработчики кликов и подобного надо передавать снаружи. контекстное меню тоже должно зависеть от таблицы
export default function Table() {
	const { isFetching } = useGetAllSI()

	const { coordinates, isSelected, item, positionHandler } = useContextMenu()

	return (
		<Stack sx={{ maxWidth: '100%', overflowY: 'hidden', overflowX: 'auto', position: 'relative' }}>
			<Header />

			{/* //TODO что-то мне кажется что этот loader лишний */}
			{isFetching && (
				<Box width={'100%'} zIndex={5} marginY={'-2px'} height={4}>
					<LinearProgress />
				</Box>
			)}
			{/* //TODO при клике вся таблица перерисовывается */}
			<Body itemId={item?.id} positionHandler={positionHandler} />

			<ContextMenu
				coordinates={coordinates}
				isSelected={isSelected}
				item={item}
				positionHandler={positionHandler}
			/>
		</Stack>
	)
}
