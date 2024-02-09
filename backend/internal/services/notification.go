package services

import (
	"fmt"
	"time"

	"github.com/Alexander272/si_accounting/backend/internal/config"
	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/pkg/logger"
	"github.com/go-co-op/gocron/v2"
)

type NotificationService struct {
	cron            gocron.Scheduler
	iterationNumber int
	dates           []time.Time
}

func NewNotificationService() *NotificationService {
	cron, err := gocron.NewScheduler()
	if err != nil {
		logger.Fatalf("failed to create new scheduler. error: %s", err.Error())
	}

	return &NotificationService{
		cron:            cron,
		iterationNumber: 0,
		// dates:           make([]time.Time, 5),
	}
}

type Notification interface {
	Start(conf *config.NotificationConfig) error
	Stop() error
}

// запуск заданий в cron
func (s *NotificationService) Start(conf *config.NotificationConfig) error {
	s.dates = make([]time.Time, len(conf.Times))

	now := time.Now()
	jobStart := time.Date(now.Year(), now.Month(), now.Day(), conf.StartTime, 0, 0, 0, now.Location())
	if now.Hour() > conf.StartTime {
		jobStart = jobStart.Add(24 * time.Hour)
	}
	////  вернуть нормальное время запуска
	// jobStart := now.Add(1 * time.Minute)
	logger.Info("starting jobs time ", jobStart.Format("02.01.2006 15:04:05"))

	job := gocron.DurationJob(conf.Interval)
	task := gocron.NewTask(s.Send, conf.Times)
	jobStartAt := gocron.WithStartAt(gocron.WithStartDateTime(jobStart))

	_, err := s.cron.NewJob(job, task, jobStartAt)
	if err != nil {
		return fmt.Errorf("failed to create new job. error: %w", err)
	}

	//? запуск крона каждый день
	// задать условия при выполнении которых будет вызывать функция отправки уведомления
	// условия похоже надо задавать массивом и как-то переключаться между элементами
	// например, задать индекс, увеличивать его после каждого вызова и брать остаток от деления на длину массива

	s.cron.Start()

	// logger.Info(j.NextRun())

	return nil
}

// остановка заданий в cron
func (s *NotificationService) Stop() error {
	if err := s.cron.Shutdown(); err != nil {
		return fmt.Errorf("failed to shutdown cron scheduler. error: %w", err)
	}
	return nil
}

// можно с go cron каждый день вызывать определенную функцию которая будет отправлять уведомления
// в функции будет текущая дата сравниваться с ожидаемой (либо задана, либо вычисляется по заданному условию) и если сравнение не проходит функция дальше не идет

func (s *NotificationService) Send(times []models.NotificationTime) {
	index := s.iterationNumber % len(times)
	logger.Debug("job started ", index)

	notificationTime := times[index]

	switch notificationTime.Type {
	case "sub":
		now := time.Now()
		// возможно часы надо все-таки обнулить (как бы ошибок не было из-за часов)
		monthEnd := time.Date(now.Year(), now.Month()+1, 0, now.Hour(), 0, 0, 0, now.Location())
		date := monthEnd.Add(-notificationTime.Sub)
		s.dates[index] = date

		logger.Debug("index ", index, " date ", date.Format("02.01.2006 15:04:05"))
	case "add":
		start := time.Now()
		if index > 0 && s.dates[index-1].Year() > 1 {
			start = s.dates[index-1]
		}
		date := start.Add(notificationTime.Add)
		s.dates[index] = date

		logger.Debug("index ", index, " date ", date.Format("02.01.2006 15:04:05"))
	case "date":
		now := time.Now()
		date := time.Date(now.Year(), now.Month(), 0, 0, 0, 0, 0, now.Location()).Add(notificationTime.Date)
		s.dates[index] = date

		logger.Debug("index ", index, " date ", date.Format("02.01.2006 15:04:05"))
	}

	if !s.dates[index].Before(time.Now()) {
		return
	}

	logger.Debug("before")
	s.iterationNumber = index + 1

	// надо еще как-то получать список оборудования которое нужно отправить и список людей которым его надо разослать
	//TODO send notification
}
