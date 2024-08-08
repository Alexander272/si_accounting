import { FC } from 'react'
import { ListItemIcon, MenuItem } from '@mui/material'
import dayjs from 'dayjs'

import { useGetLastLocationQuery } from '@/features/location/locationApiSlice'
import { CancelIcon } from '@/components/Icons/CancelIcon'

type Props = {
	itemId?: string
	onClick?: () => void
}

export const CancelMove: FC<Props> = ({ itemId, onClick }) => {
	const { data } = useGetLastLocationQuery(itemId || '', { skip: !itemId })

	if (!data?.data || (data.data.dateOfIssue != dayjs().startOf('d').unix() && data.data.status != 'moved'))
		return null

	return (
		<MenuItem onClick={onClick}>
			<ListItemIcon>
				<CancelIcon fontSize={18} fill={'#757575'} />
			</ListItemIcon>
			Отменить перемещение
		</MenuItem>
	)
}
