package services

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"strings"

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

	resp, err := http.Post(s.url+apiPath, "application/json", &buf)
	if err != nil {
		return fmt.Errorf("failed to send data to bot. error: %w", err)
	}

	if !strings.HasPrefix(resp.Status, "2") {
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return fmt.Errorf("client: could not read response body: %w", err)
		}

		return fmt.Errorf("request returned an error: %s", string(body))
	}

	return nil
}
