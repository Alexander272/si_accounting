import { Instrument } from '@/features/instrument/types/instrument'
import { Location } from '@/features/location/types/location'
import { IVerification } from '@/features/verification/types/verification'

export interface INewSI {
	instrument: Instrument
	verification: IVerification
	location: Location
}
