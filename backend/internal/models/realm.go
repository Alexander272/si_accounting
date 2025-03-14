package models

import "time"

type Realm struct {
	Id               string    `json:"id" db:"id"`
	Name             string    `json:"name" db:"name"`
	Realm            string    `json:"realm" db:"realm"`
	IsActive         bool      `json:"isActive" db:"is_active"`
	ReserveChannel   string    `json:"reserveChannel" db:"reserve_channel"`
	ExpirationNotice bool      `json:"expirationNotice" db:"expiration_notice"`
	LocationType     string    `json:"locationType" db:"location_type"`
	HasResponsible   bool      `json:"hasResponsible" db:"has_responsible"`
	NeedResponsible  bool      `json:"needResponsible" db:"need_responsible"`
	NeedConfirmed    bool      `json:"needConfirmed" db:"need_confirmed"`
	Created          time.Time `json:"created" db:"created_at"`
}

type GetRealmsDTO struct {
	All bool `json:"all"`
}

type GetRealmByIdDTO struct {
	Id string `json:"id" db:"id" binding:"required"`
}

type GetRealmByUserDTO struct {
	UserId string `json:"userId" db:"user_id"`
}

type ChooseRealmDTO struct {
	RealmId string `json:"realmId" db:"realm_id" binding:"required"`
	UserId  string `json:"userId"`
	Role    string `json:"role"`
}

type RealmDTO struct {
	Id               string `json:"id" db:"id"`
	Name             string `json:"name" db:"name" binding:"required"`
	Realm            string `json:"realm" db:"realm" binding:"required"`
	IsActive         bool   `json:"isActive" db:"is_active"`
	ReserveChannel   string `json:"reserveChannel" db:"reserve_channel"`
	ExpirationNotice bool   `json:"expirationNotice" db:"expiration_notice"`
	LocationType     string `json:"locationType" db:"location_type"`
	HasResponsible   bool   `json:"hasResponsible" db:"has_responsible"`
	NeedResponsible  bool   `json:"needResponsible" db:"need_responsible"`
	NeedConfirmed    bool   `json:"needConfirmed" db:"need_confirmed"`
}

type DeleteRealmDTO struct {
	Id string `json:"id" db:"id" binding:"required"`
}
