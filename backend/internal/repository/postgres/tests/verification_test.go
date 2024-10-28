package tests_test

import (
	"context"
	"database/sql"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	sqlxmock "github.com/zhashkevych/go-sqlxmock"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/repository/postgres"
)

func TestVerificationRepoCreate(t *testing.T) {
	db, mock, err := sqlxmock.Newx()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	r := postgres.NewVerificationRepo(db)

	t.Run("success", func(t *testing.T) {
		v := &models.CreateVerificationDTO{
			InstrumentId: uuid.NewString(),
			Date:         123,
			NextDate:     456,
			RegisterLink: "register-link",
			Status:       "status",
			NotVerified:  true,
			Notes:        "notes",
		}
		// mockId := uuid.New()

		rows := sqlxmock.NewRows([]string{"id"})
		mock.ExpectQuery(`INSERT INTO verification_table`).WithArgs(
			"id", "instrument_id", "date", "next_date", "register_link", "status", "not_verified", "notes",
		).WillReturnRows(rows)
		// mock.ExpectExec(`INSERT INTO verification_table`).WithArgs(
		// 	mockId, v.InstrumentId, v.Date, v.NextDate, v.RegisterLink, v.Status, v.NotVerified, v.Notes,
		// ).WillReturnResult(sqlxmock.NewResult(1, 1))

		id, err := r.Create(context.Background(), v)
		assert.NoError(t, err)
		assert.NotEmpty(t, id)
	})

	t.Run("error executing query", func(t *testing.T) {
		v := &models.CreateVerificationDTO{
			InstrumentId: "instrument-id",
			Date:         123,
			NextDate:     456,
			RegisterLink: "register-link",
			Status:       "status",
			NotVerified:  true,
			Notes:        "notes",
		}
		id := uuid.New()

		mock.ExpectExec(`INSERT INTO verification_table`).WithArgs(
			id, v.InstrumentId, v.Date, v.NextDate, v.RegisterLink, v.Status, v.NotVerified, v.Notes,
		).WillReturnError(sql.ErrConnDone)

		_, err := r.Create(context.Background(), v)
		assert.Error(t, err)
	})

	// t.Run("error generating UUID", func(t *testing.T) {
	// 	// This test is a bit tricky, as we can't easily mock the uuid package.
	// 	// We'll just test that the error is propagated correctly.
	// 	v := &models.CreateVerificationDTO{
	// 		InstrumentId: "instrument-id",
	// 		Date:         123,
	// 		NextDate:     456,
	// 		RegisterLink: "register-link",
	// 		Status:       "status",
	// 		NotVerified:  true,
	// 		Notes:        "notes",
	// 	}

	// 	// Simulate an error generating a UUID
	// 	uuid.New = func() string {
	// 		return ""
	// 	}
	// 	defer func() { uuid.New = uuid.New }()

	// 	_, err := r.Create(context.Background(), v)
	// 	assert.Error(t, err)
	// })
}
