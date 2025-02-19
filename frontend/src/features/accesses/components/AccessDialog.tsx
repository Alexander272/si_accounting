import { FC } from 'react'
import { Button, FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

import type { IFetchError } from '@/app/types/error'
import type { IAccesses, IAccessesDTO } from '../types/accesses'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { changeDialogIsOpen, getDialogState } from '@/features/dialog/dialogSlice'
import { Dialog } from '@/features/dialog/components/Dialog'
import { useGetRolesQuery } from '@/features/user/roleApiSlice'
import { Fallback } from '@/components/Fallback/Fallback'

type Context = { item?: IAccesses; realm?: string }

export const AccessDialog = () => {
	const modal = useAppSelector(getDialogState('Access'))
	const dispatch = useAppDispatch()

	const closeHandler = () => {
		dispatch(changeDialogIsOpen({ variant: 'Access', isOpen: false }))
	}

	return (
		<Dialog
			title={(modal?.content as Context)?.item ? 'Редактировать доступ' : 'Добавить доступ'}
			body={<Form {...(modal?.content as Context)} />}
			open={modal?.isOpen || false}
			onClose={closeHandler}
			maxWidth='xs'
			fullWidth
		/>
	)
}

const defaultValues: IAccessesDTO = {
	userId: '',
	roleId: '',
	realmId: '',
}

export const Form: FC<Context> = ({ item, realm }) => {
	const dispatch = useAppDispatch()

	const { data: roles, isFetching: rolesIsFetching } = useGetRolesQuery(null)

	const { control, handleSubmit } = useForm<IAccessesDTO>({
		values: item
			? { id: item.id, userId: item.user.id, roleId: item.role.id, realmId: realm || '' }
			: { ...defaultValues, realmId: realm || '' },
	})

	const closeHandler = () => {
		dispatch(changeDialogIsOpen({ variant: 'Access', isOpen: false }))
	}

	const saveHandler = handleSubmit(async form => {
		console.log('save', form)

		const dto = {
			...form,
			id: item?.id || '',
		}
		console.log(dto)

		try {
			// if (item?.id) await update(dto).unwrap()
			// else await create(dto).unwrap()
			closeHandler()
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
		}
	})

	return (
		<Stack component={'form'} paddingX={2} position={'relative'} spacing={2} onSubmit={saveHandler}>
			{rolesIsFetching ? <Fallback position={'absolute'} zIndex={5} background={'#f5f5f557'} /> : null}

			{/* Users следует сделать autocomplete */}

			<FormControl>
				<InputLabel id={'role'}>Роль</InputLabel>
				<Controller
					control={control}
					name='roleId'
					render={({ field, fieldState: { error } }) => (
						<Select labelId={'role'} label={'Роль'} error={Boolean(error)} {...field}>
							<MenuItem value='' disabled>
								Выберите роль
							</MenuItem>

							{roles?.data.map(o => (
								<MenuItem key={o.id} value={o.id}>
									{o.name} {o.description ? `(${o.description})` : ''}
								</MenuItem>
							))}
						</Select>
					)}
				/>
			</FormControl>

			<Stack spacing={2} direction={'row'}>
				<Button type='submit' variant='contained' fullWidth>
					Сохранить
				</Button>
				<Button onClick={closeHandler} variant='outlined' fullWidth>
					Отмена
				</Button>
			</Stack>
		</Stack>
	)
}
