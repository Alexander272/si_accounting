package services

import (
	"bytes"
	"context"
	"net/http"
	"time"

	"github.com/Alexander272/si_accounting/backend/internal/constants"
	"github.com/Alexander272/si_accounting/backend/internal/models/bot"
	"github.com/Alexander272/si_accounting/backend/pkg/logger"
	"github.com/goccy/go-json"
)

type ErrorBotService struct {
	URL string
}

func NewErrorBotService(url string) *ErrorBotService {
	return &ErrorBotService{
		URL: url + constants.ErrorBotApi,
	}
}

type ErrorBot interface {
	Send(context.Context, bot.Data)
}

func (s *ErrorBotService) Send(ctx context.Context, data bot.Data) {
	var req []byte
	if data.Request != nil {
		var err error
		req, err = json.Marshal(data.Request)
		if err != nil {
			logger.Error("failed to marshal request body.", logger.ErrAttr(err))
		}
	}

	message := bot.Message{
		Service: bot.Service{
			Id:   "sia",
			Name: "SI Accounting",
		},
		Data: bot.MessageData{
			Date:    time.Now().Format("02/01/2006 - 15:04:05"),
			IP:      data.IP,
			URL:     data.Url,
			Error:   data.Error,
			Request: string(req),
		},
	}

	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(message); err != nil {
		logger.Error("failed to encode struct.", logger.ErrAttr(err))
	}

	_, err := http.Post(s.URL, "application/json", &buf)
	if err != nil {
		logger.Error("failed to send error to bot.", logger.ErrAttr(err))
	}
}
