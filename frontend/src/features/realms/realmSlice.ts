import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import type { RootState } from '@/app/store'
import type { IRealm } from './types/realm'
import { RealmKey } from './constants/storage'

interface IRealmState {
	realm: IRealm | null
}

const initialState: IRealmState = {
	realm: JSON.parse(localStorage.getItem(RealmKey) || 'null'),
}

const realmSlice = createSlice({
	name: 'realm',
	initialState,
	reducers: {
		setRealm: (state, action: PayloadAction<IRealm>) => {
			state.realm = action.payload
			localStorage.setItem(RealmKey, JSON.stringify(state.realm))
		},

		resetRealm: () => initialState,
	},
})

export const getRealm = (state: RootState) => state.realm.realm

export const realmPath = realmSlice.name
export const realmReducer = realmSlice.reducer

export const { setRealm, resetRealm } = realmSlice.actions
