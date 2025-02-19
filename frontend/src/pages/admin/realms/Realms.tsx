import { useState } from 'react'
import { Box, Breadcrumbs, Stack } from '@mui/material'

import { AppRoutes } from '@/constants/routes'
import { PageBox } from '@/styled/PageBox'
import { RealmsList } from '@/features/realms/components/RealmsList'
import { RealmForm } from '@/features/realms/components/RealmForm'
import { AccessesTable } from '@/features/accesses/components/AccessesTable'
import { Breadcrumb } from '@/components/Breadcrumb/Breadcrumb'

export default function Realms() {
	const [realm, setRealm] = useState('new')

	const realmHandler = (realm: string) => {
		setRealm(realm)
	}

	return (
		<PageBox>
			<Box
				borderRadius={3}
				padding={2}
				margin={'0 auto'}
				width={'66%'}
				border={'1px solid rgba(0, 0, 0, 0.12)'}
				flexGrow={1}
				display={'flex'}
				flexDirection={'column'}
				sx={{ backgroundColor: '#fff', userSelect: 'none' }}
			>
				<Breadcrumbs aria-label='breadcrumb' sx={{ mb: 2 }}>
					<Breadcrumb to={AppRoutes.HOME}>Главная</Breadcrumb>
					<Breadcrumb to={AppRoutes.REALMS} active>
						Области
					</Breadcrumb>
				</Breadcrumbs>

				<Stack direction={'row'} spacing={2} height={'100%'}>
					<RealmsList realm={realm} setRealm={realmHandler} />
					<Stack width={'100%'} spacing={3} sx={{ maxHeight: 760, overflowY: 'auto', pt: 1 }}>
						<RealmForm realm={realm} setRealm={realmHandler} />
						{realm != 'new' && <AccessesTable realm={realm} />}
					</Stack>
				</Stack>
			</Box>
		</PageBox>
	)
}
