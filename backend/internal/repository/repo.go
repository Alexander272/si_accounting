package repository

import (
	"github.com/go-redis/redis"
	"github.com/jmoiron/sqlx"
)

type Repository struct{}

func NewRepository(db *sqlx.DB, redis redis.Cmdable) *Repository {
	return &Repository{}
}
