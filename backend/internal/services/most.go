package services

import (
	"bytes"
	"context"
	"fmt"
	"net/http"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/goccy/go-json"
)

type MostService struct {
	url string
}

func NewMostService(url string) *MostService {
	return &MostService{
		url: url,
	}
}

type Most interface {
	Send(context.Context, models.Notification) error
}

func (s *MostService) Send(ctx context.Context, data models.Notification) error {
	apiPath := "/api/send/notification"

	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(data); err != nil {
		return fmt.Errorf("failed to encode notification data. error: %w", err)
	}

	_, err := http.Post(s.url+apiPath, "application/json", &buf)
	if err != nil {
		return fmt.Errorf("failed to send data to bot. error: %w", err)
	}

	return nil
}
