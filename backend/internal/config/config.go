package config

import (
	"fmt"
	"time"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/ilyakaznacheev/cleanenv"
)

type (
	Config struct {
		Environment string `yaml:"environment" env:"APP_ENV" env-default:"dev"`
		// Redis        RedisConfig
		Postgres     PostgresConfig
		Auth         AuthConfig
		Keycloak     KeycloakConfig
		Http         HttpConfig
		Limiter      LimiterConfig
		Notification NotificationConfig
		Bot          BotConfig
		ErrorBot     ErrorBotConfig
	}

	HttpConfig struct {
		Host               string        `yaml:"host" env:"HOST" env-default:"localhost"`
		Port               string        `yaml:"port" env:"PORT" env-default:"8080"`
		ReadTimeout        time.Duration `yaml:"read_timeout" env:"READ_TIMEOUT" env-default:"10s"`
		WriteTimeout       time.Duration `yaml:"write_timeout" env:"WRITE_TIMEOUT" env-default:"10s"`
		MaxHeaderMegabytes int           `yaml:"max_header_bytes" env-default:"1"`
	}

	// RedisConfig struct {
	// 	Host     string `yaml:"host" env:"REDIS_HOST"`
	// 	Port     string `yaml:"port" env:"REDIS_PORT"`
	// 	DB       int    `yaml:"db" env:"REDIS_DB"`
	// 	Password string `env:"REDIS_PASSWORD"`
	// }

	PostgresConfig struct {
		Host     string `yaml:"host" env:"POSTGRES_HOST"`
		Port     string `yaml:"port" env:"POSTGRES_PORT"`
		Username string `yaml:"username" env:"POSTGRES_NAME"`
		Password string `env:"POSTGRES_PASSWORD"`
		DbName   string `yaml:"db_name" env:"POSTGRES_DB"`
		SSLMode  string `yaml:"ssl_mode" env:"POSTGRES_SSL"`
	}

	AuthConfig struct {
		AccessTokenTTL  time.Duration `yaml:"access_token_ttl" env-default:"10m"`
		RefreshTokenTTL time.Duration `yaml:"refresh_token_ttl" env-default:"12h"`
		LimitAuthTTL    time.Duration `yaml:"limit_auth_ttl" env-default:"30m"`
		CountAttempt    int32         `yaml:"count_attempt" env-default:"5"`
		Secure          bool          `yaml:"secure" env-default:"false"`
		Domain          string        `yaml:"domain" env-default:"sealur.ru"`
		Key             string        `env:"JWT"`
	}

	KeycloakConfig struct {
		Url          string `yaml:"keycloak_url" env:"KEYCLOAK_URL"`
		ClientId     string `env:"KEYCLOAK_CLIENT_ID"`
		ClientSecret string `env:"KEYCLOAK_CLIENT_SECRET"`
		Realm        string `yaml:"keycloak_realm" env:"KEYCLOAK_REALM"`
		Root         string `env:"KEYCLOAK_ROOT"`
		RootPass     string `env:"KEYCLOAK_ROOT_PASS"`
	}

	LimiterConfig struct {
		RPS   int           `yaml:"rps" env:"RPS" env-default:"10"`
		Burst int           `yaml:"burst" env:"BURST" env-default:"20"`
		TTL   time.Duration `yaml:"ttl" env:"TTL" env-default:"10m"`
	}

	NotificationConfig struct {
		StartTime int                       `yaml:"start_time" env-default:"12"` // 12 hours (noon)
		Interval  time.Duration             `yaml:"interval" env-default:"24h"`
		Times     []models.NotificationTime `yaml:"times"`
	}

	ErrorBotConfig struct {
		Url     string `yaml:"err_bot_url" env:"ERR_BOT_URL"`
		ApiPath string `yaml:"err_api_path" env:"ERR_API_PATH"`
	}

	BotConfig struct {
		ReserveUserId string `yaml:"reserve_user_id" env:"RESERVE_USER_ID"`
		Url           string `yaml:"bot_url" env:"BOT_URL"`
	}
)

func Init(path string) (*Config, error) {
	var conf Config

	if err := cleanenv.ReadConfig(path, &conf); err != nil {
		return nil, fmt.Errorf("failed to read config file. error: %w", err)
	}

	if err := cleanenv.ReadEnv(&conf); err != nil {
		return nil, fmt.Errorf("failed to read env file. error: %w", err)
	}

	return &conf, nil
}
