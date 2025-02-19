import { FC, useEffect } from 'react'
import { Button, FormControlLabel, Stack, Switch, TextField, useTheme } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

import type { IFetchError } from '@/app/types/error'
import type { IRealm } from '../types/realm'
import { Fallback } from '@/components/Fallback/Fallback'
import { SaveIcon } from '@/components/Icons/SaveIcon'
import { Confirm } from '@/components/Confirm/Confirm'
import { FileDeleteIcon } from '@/components/Icons/FileDeleteIcon'
import {
	useCreateRealmMutation,
	useDeleteRealmMutation,
	useGetRealmByIdQuery,
	useUpdateRealmMutation,
} from '../realmsApiSlice'

type Props = {
	realm: string
	setRealm: (realm: string) => void
}

type Form = Pick<IRealm, 'name' | 'realm' | 'isActive' | 'reserveChannel' | 'expirationNotice' | 'locationType'>

const defaultValues: Form = {
	name: '',
	realm: '',
	isActive: true,
	reserveChannel: '',
	expirationNotice: false,
	locationType: '',
}

export const RealmForm: FC<Props> = ({ realm, setRealm }) => {
	const { palette } = useTheme()

	const { data, isFetching } = useGetRealmByIdQuery(realm, { skip: !realm || realm == 'new' })

	const [create, { isLoading: isCreating }] = useCreateRealmMutation()
	const [update, { isLoading: isUpdating }] = useUpdateRealmMutation()
	const [remove, { isLoading: isDeleting }] = useDeleteRealmMutation()

	const {
		control,
		reset,
		handleSubmit,
		formState: { dirtyFields },
	} = useForm<Form>({ values: defaultValues })

	useEffect(() => {
		if (data && realm != 'new') reset(data.data)
		else reset(defaultValues)
	}, [data, reset, realm])

	const saveHandler = handleSubmit(async form => {
		console.log('save', form, dirtyFields)
		if (!Object.keys(dirtyFields).length) return

		const newData = { ...form, id: data?.data.id || '' }
		try {
			if (realm == 'new') {
				const payload = await create(newData).unwrap()
				setRealm(payload.id)
				toast.success('Область создана')
			} else {
				await update(newData).unwrap()
				toast.success('Область обновлена')
			}
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
		}
	})

	const deleteHandler = async () => {
		if (realm == 'new') return
		try {
			await remove(realm).unwrap()
			setRealm('new')
			toast.success('Область удалена')
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
		}
	}

	return (
		<Stack component={'form'} onSubmit={saveHandler} alignItems={'center'} position={'relative'}>
			{isFetching || isDeleting || isUpdating || isCreating ? (
				<Fallback position={'absolute'} zIndex={5} background={'#f5f5f557'} />
			) : null}

			<Stack direction={'row'} flexGrow={1} spacing={2} width={860} mb={2}>
				<Controller
					control={control}
					name={'name'}
					render={({ field }) => <TextField {...field} label={'Область'} fullWidth />}
				/>

				<Controller
					control={control}
					name={'realm'}
					render={({ field }) => <TextField {...field} label={'Короткое название (код, url)'} fullWidth />}
				/>
			</Stack>

			<Stack direction={'row'} flexGrow={1} spacing={2} width={860} mb={2}>
				{/* //TODO может тут должен быть select */}
				<Controller
					control={control}
					name={'reserveChannel'}
					render={({ field }) => <TextField {...field} label={'Канал'} fullWidth />}
				/>

				{/* locationType */}
			</Stack>

			<Stack direction={'row'} flexGrow={1} spacing={2} width={860} mb={2} justifyContent={'space-between'}>
				<Controller
					control={control}
					name={'isActive'}
					render={({ field }) => (
						<FormControlLabel
							control={<Switch checked={field.value} {...field} />}
							label={field.value ? 'Активна' : 'Не активна'}
						/>
					)}
				/>

				<Button
					variant='outlined'
					type='submit'
					disabled={!Object.keys(dirtyFields).length}
					sx={{
						minWidth: 56,
					}}
				>
					<SaveIcon
						fontSize={18}
						fill={!Object.keys(dirtyFields).length ? palette.action.disabled : palette.primary.main}
					/>
				</Button>
			</Stack>
			<Stack direction={'row'} flexGrow={1} spacing={2} width={860} mb={2} justifyContent={'space-between'}>
				<Controller
					control={control}
					name={'expirationNotice'}
					render={({ field }) => (
						<FormControlLabel
							control={<Switch checked={field.value} {...field} />}
							label={`Уведомления о поверках ${field.value ? 'включены' : 'выключены'}`}
						/>
					)}
				/>

				<Confirm
					onClick={deleteHandler}
					buttonComponent={
						<Button
							variant='outlined'
							color='error'
							disabled={realm == 'new'}
							sx={{ minWidth: 56, height: '100%' }}
						>
							<FileDeleteIcon
								fontSize={20}
								fill={realm == 'new' ? palette.action.disabled : palette.error.main}
							/>
						</Button>
					}
					confirmText='Вы уверены, что хотите удалить область?'
					width='56'
				/>
			</Stack>
		</Stack>
	)
}
