package services

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/Alexander272/si_accounting/backend/internal/config"
	"github.com/Alexander272/si_accounting/backend/pkg/error_bot"
	"github.com/Alexander272/si_accounting/backend/pkg/logger"
	"github.com/go-co-op/gocron/v2"
)

type SchedulerService struct {
	cron         gocron.Scheduler
	notification SINotification
	user         User
	location     Location
}

type SchedulerDeps struct {
	Notification SINotification
	User         User
	Location     Location
}

func NewSchedulerService(deps *SchedulerDeps) *SchedulerService {
	cron, err := gocron.NewScheduler()
	if err != nil {
		log.Fatalf("failed to create new scheduler. error: %s", err.Error())
	}

	return &SchedulerService{
		cron:         cron,
		notification: deps.Notification,
		user:         deps.User,
		location:     deps.Location,
	}
}

type Scheduler interface {
	Start(conf *config.SchedulerConfig) error
	Stop() error
}

// запуск заданий в cron
func (s *SchedulerService) Start(conf *config.SchedulerConfig) error {
	now := time.Now()
	jobStart := time.Date(now.Year(), now.Month(), now.Day(), conf.StartTime, 0, 0, 0, now.Location())
	if now.Hour() >= conf.StartTime {
		jobStart = jobStart.Add(24 * time.Hour)
	}
	// // вернуть нормальное время запуска
	// jobStart := now.Add(1 * time.Minute)
	logger.Info("starting jobs time " + jobStart.Format("02.01.2006 15:04:05"))

	job := gocron.DurationJob(conf.Interval)
	task := gocron.NewTask(s.job)
	jobStartAt := gocron.WithStartAt(gocron.WithStartDateTime(jobStart))

	_, err := s.cron.NewJob(job, task, jobStartAt)
	if err != nil {
		return fmt.Errorf("failed to create new job. error: %w", err)
	}

	//? запуск крона через интервал (по умолчанию день)
	s.cron.Start()
	return nil
}

// остановка заданий в cron
func (s *SchedulerService) Stop() error {
	if err := s.cron.Shutdown(); err != nil {
		return fmt.Errorf("failed to shutdown cron scheduler. error: %w", err)
	}
	return nil
}

func (s *SchedulerService) job() {
	logger.Info("job was started")

	// принудительное получение инструмента, который не принимают более 20 дней
	if err := s.location.ForcedReceiptMany(context.Background()); err != nil {
		logger.Error("location forced receipt error:", logger.ErrAttr(err))
		error_bot.Send(nil, err.Error(), nil)
		return
	}

	s.notification.CheckUsedSI()
	s.notification.CheckSentSI()

	// Синхронизация пользователей с keycloak
	if err := s.user.Sync(context.Background()); err != nil {
		logger.Error("user sync error:", logger.ErrAttr(err))
		error_bot.Send(nil, err.Error(), nil)
		return
	}
}
