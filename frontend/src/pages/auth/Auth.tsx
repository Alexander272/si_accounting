import { Box, useTheme } from '@mui/material'

import { SignInForm } from '@/features/auth/components/SignInForm'
import { PageBox } from '@/styled/PageBox'

export default function Auth() {
	const { palette } = useTheme()

	return (
		<PageBox>
			<Box display={'flex'} flexDirection={'column'} justifyContent={'center'} alignItems={'center'} flexGrow={1}>
				<Box
					marginX={3}
					borderRadius={4}
					paddingY={2.5}
					paddingX={3.75}
					width={{ sm: 400, xs: '100%' }}
					boxShadow={'2px 2px 8px 0px #3636362b'}
					sx={{ background: palette.background.paper }}
				>
					<SignInForm />
				</Box>
			</Box>
		</PageBox>
	)
}
