package models

type Verification struct {
	Id           string `json:"id" db:"id"`
	InstrumentId string `json:"instrumentId" db:"instrument_id"`
	// Date         string `json:"date" db:"date"`
	// NextDate     string `json:"nextDate" db:"next_date"`
	Date     int64 `json:"date" db:"date"`
	NextDate int64 `json:"nextDate" db:"next_date"`
	// FileLink     string `json:"fileLink" db:"file_link"`
	RegisterLink string `json:"registerLink" db:"register_link"`
	NotVerified  bool   `json:"notVerified" db:"not_verified"`
	Status       string `json:"status" db:"status"`
	Notes        string `json:"notes" db:"notes"`
}

type CreateVerificationDTO struct {
	InstrumentId string `form:"instrumentId" json:"instrumentId" db:"instrument_id"`
	// Date              string `form:"date" json:"date" db:"date" binding:"required"`
	// NextDate          string `form:"nextDate" json:"nextDate" db:"next_date"`
	Date     int64 `json:"date" db:"date" binding:"required,gte=1000000"`
	NextDate int64 `json:"nextDate" db:"next_date,gte=1000000"`
	// FileLink          string `form:"fileLink" json:"fileLink" db:"file_link"`
	RegisterLink      string `form:"registerLink" json:"registerLink" db:"register_link"`
	NotVerified       bool   `json:"notVerified" db:"not_verified"`
	Status            string `form:"status" json:"status" db:"status"`
	Notes             string `form:"notes" json:"notes" db:"notes"`
	IsDraftInstrument bool   `form:"isDraftInstrument" json:"isDraftInstrument"`
	// Files        []*multipart.FileHeader `form:"files"`
}

type UpdateVerificationDTO struct {
	Id           string `json:"id" db:"id" binding:"required"`
	InstrumentId string `json:"instrumentId" db:"instrument_id" binding:"required"`
	// Date         string `json:"date" db:"date" binding:"required"`
	// NextDate     string `json:"nextDate" db:"next_date"`
	Date     int64 `json:"date" db:"date"`
	NextDate int64 `json:"nextDate" db:"next_date"`
	// FileLink     string `json:"fileLink" db:"file_link"`
	RegisterLink string `json:"registerLink" db:"register_link"`
	NotVerified  bool   `json:"notVerified" db:"not_verified"`
	Status       string `json:"status" db:"status"`
	Notes        string `json:"notes" db:"notes"`
}

type VerificationDataDTO struct {
	Id           string `json:"id" db:"id"`
	InstrumentId string `json:"instrumentId" db:"instrument_id"`
	// Date         string     `json:"date" db:"date"`
	// NextDate     string     `json:"nextDate" db:"next_date"`
	Date     int64 `json:"date" db:"date"`
	NextDate int64 `json:"nextDate" db:"next_date"`
	// FileLink     string     `json:"fileLink" db:"file_link"`
	RegisterLink string      `json:"registerLink" db:"register_link"`
	NotVerified  bool        `json:"notVerified" db:"not_verified"`
	Status       string      `json:"status" db:"status"`
	Notes        string      `json:"notes" db:"notes"`
	Documents    []*Document `json:"documents"`
}
