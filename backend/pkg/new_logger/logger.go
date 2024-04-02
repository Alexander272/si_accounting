package logger

import (
	"log/slog"

	"go.uber.org/zap"
	"go.uber.org/zap/exp/zapslog"
)

// type Logger interface{}

func Init(mode string) *slog.Logger {
	// config := zap.Config{
	// 	OutputPaths: []string{"stdout", "/logs"},
	// }
	// config.Build()

	zapLogger := zap.Must(zap.NewProduction())

	defer zapLogger.Sync()

	logger := slog.New(zapslog.NewHandler(zapLogger.Core(), nil))

	return logger
}
