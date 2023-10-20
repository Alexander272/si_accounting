package main

import (
	"os"

	"github.com/Alexander272/si_accounting/backend/internal/config"
	"github.com/Alexander272/si_accounting/backend/pkg/logger"
	"github.com/subosito/gotenv"
)

func main() {
	//* Init config
	if err := gotenv.Load("../.env"); err != nil {
		logger.Fatalf("error loading env variables: %s", err.Error())
	}

	conf, err := config.Init("configs/config.yaml")
	if err != nil {
		logger.Fatalf("error initializing configs: %s", err.Error())
	}
	logger.Init(os.Stdout, conf.Environment)
}
