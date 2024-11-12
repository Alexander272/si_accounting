package error_bot

import (
	"bytes"
	"context"
	"net/http"
	"os"
	"time"

	"github.com/Alexander272/si_accounting/backend/internal/models/bot"
	"github.com/Alexander272/si_accounting/backend/pkg/logger"
	"github.com/goccy/go-json"
)

func Send(ctx context.Context, data bot.Data) {
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

	url := os.Getenv("ERR_URL")
	if url == "" {
		return
	}

	_, err := http.Post(url, "application/json", &buf)
	if err != nil {
		logger.Error("failed to send error to bot.", logger.ErrAttr(err))
	}
}
