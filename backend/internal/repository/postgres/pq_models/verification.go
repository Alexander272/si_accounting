package pq_models

type VerificationFullData struct {
	Id           string `db:"id"`
	InstrumentId string `db:"instrument_id"`
	Date         int64  `db:"date"`
	NextDate     int64  `db:"next_date"`
	FileLink     string `db:"file_link"`
	RegisterLink string `db:"register_link"`
	Status       string `db:"status"`
	NotVerified  bool   `db:"not_verified"`
	Notes        string `db:"notes"`
	DocId        string `db:"doc_id"`
	Label        string `db:"label"`
	Size         int64  `db:"size"`
	Path         string `db:"path"`
	DocumentType string `db:"type"`
}
