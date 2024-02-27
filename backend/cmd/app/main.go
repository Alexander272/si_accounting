package main

import (
	"context"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/Alexander272/si_accounting/backend/internal/config"
	"github.com/Alexander272/si_accounting/backend/internal/repository"
	"github.com/Alexander272/si_accounting/backend/internal/server"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	transport "github.com/Alexander272/si_accounting/backend/internal/transport/http"
	"github.com/Alexander272/si_accounting/backend/pkg/auth"
	"github.com/Alexander272/si_accounting/backend/pkg/database/postgres"
	"github.com/Alexander272/si_accounting/backend/pkg/database/redis"
	"github.com/Alexander272/si_accounting/backend/pkg/logger"
	_ "github.com/lib/pq"
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

	//* Dependencies
	db, err := postgres.NewPostgresDB(postgres.Config{
		Host:     conf.Postgres.Host,
		Port:     conf.Postgres.Port,
		Username: conf.Postgres.Username,
		Password: conf.Postgres.Password,
		DBName:   conf.Postgres.DbName,
		SSLMode:  conf.Postgres.SSLMode,
	})
	if err != nil {
		logger.Fatalf("failed to initialize db: %s", err.Error())
	}

	redis, err := redis.NewRedisClient(redis.Config{
		Host:     conf.Redis.Host,
		Port:     conf.Redis.Port,
		DB:       conf.Redis.DB,
		Password: conf.Redis.Password,
	})
	if err != nil {
		logger.Fatalf("failed to initialize redis %s", err.Error())
	}

	keycloak := auth.NewKeycloakClient(auth.Deps{
		Url:       conf.Keycloak.Url,
		ClientId:  conf.Keycloak.ClientId,
		Realm:     conf.Keycloak.Realm,
		AdminName: conf.Keycloak.Root,
		AdminPass: conf.Keycloak.RootPass,
	})

	//* Services, Repos & API Handlers
	repos := repository.NewRepository(db, redis)
	services := services.NewServices(services.Deps{
		Repos:           repos,
		Keycloak:        keycloak,
		AccessTokenTTL:  conf.Auth.AccessTokenTTL,
		RefreshTokenTTL: conf.Auth.RefreshTokenTTL,
		ErrorBotUrl:     conf.ErrorBot.Url,
		BotUrl:          conf.Bot.Url,
	})

	// casbin := casbin.NewCasbinService(services.Role, services.User, "configs/privacy.conf")

	// handlers := transport.NewHandler(services, casbin, keycloak)
	handlers := transport.NewHandler(services, keycloak)

	//* HTTP Server

	if err := services.Notification.Start(&conf.Notification); err != nil {
		logger.Fatalf("failed to start sending notification. error: %s\n", err.Error())
	}

	srv := server.NewServer(conf, handlers.Init(conf))
	go func() {
		if err := srv.Run(); !errors.Is(err, http.ErrServerClosed) {
			logger.Fatalf("error occurred while running http server: %s\n", err.Error())
		}
	}()
	logger.Infof("Application started on port: %s", conf.Http.Port)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGTERM, syscall.SIGINT)

	<-quit

	const timeout = 5 * time.Second

	ctx, shutdown := context.WithTimeout(context.Background(), timeout)
	defer shutdown()

	if err := services.Notification.Stop(); err != nil {
		logger.Errorf("failed to stop sending notification. error: %s", err)
	}

	if err := srv.Stop(ctx); err != nil {
		logger.Errorf("failed to stop server: %v", err)
	}
}
