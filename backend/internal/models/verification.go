package models

type Verification struct {
	Id           string `json:"id" db:"id"`
	InstrumentId string `json:"instrumentId" db:"instrument_id"`
	Date         string `json:"date" db:"date"`
	NextDate     string `json:"nextDate" db:"next_date"`
	FileLink     string `json:"fileLink" db:"file_link"`
	RegisterLink string `json:"registerLink" db:"register_link"`
	Status       string `json:"status" db:"status"`
}

type CreateVerificationDTO struct {
	InstrumentId string `json:"instrumentId" db:"instrument_id" binding:"required"`
	Date         string `json:"date" db:"date" binding:"required"`
	NextDate     string `json:"nextDate" db:"next_date"`
	FileLink     string `json:"fileLink" db:"file_link"`
	RegisterLink string `json:"registerLink" db:"register_link"`
	Status       string `json:"status" db:"status"`
}

type UpdateVerificationDTO struct {
	Id           string `json:"id" db:"id" binding:"required"`
	InstrumentId string `json:"instrumentId" db:"instrument_id" binding:"required"`
	Date         string `json:"date" db:"date" binding:"required"`
	NextDate     string `json:"nextDate" db:"next_date"`
	FileLink     string `json:"fileLink" db:"file_link"`
	RegisterLink string `json:"registerLink" db:"register_link"`
	Status       string `json:"status" db:"status"`
}
