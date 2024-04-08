import { Badge, type BadgeProps, styled } from '@mui/material'

export const HeadBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
	'& .MuiBadge-badge': {
		left: -3,
		top: 0,
		border: `2px solid ${theme.palette.background.paper}`,
		padding: '0',
	},
	anchorOrigin: { vertical: 'top', horizontal: 'left' },
}))
