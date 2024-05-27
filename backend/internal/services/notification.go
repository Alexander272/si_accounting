package services

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/Alexander272/si_accounting/backend/internal/config"
	"github.com/Alexander272/si_accounting/backend/internal/constants"
	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/models/bot"
	"github.com/Alexander272/si_accounting/backend/pkg/logger"
	"github.com/go-co-op/gocron/v2"
	"github.com/goodsign/monday"
)

type NotificationService struct {
	cron            gocron.Scheduler
	iterationNumber int
	dates           []time.Time
	si              SI
	bot             Most
	errBot          ErrorBot
}

func NewNotificationService(si SI, bot Most, errBot ErrorBot) *NotificationService {
	cron, err := gocron.NewScheduler()
	if err != nil {
		log.Fatalf("failed to create new scheduler. error: %s", err.Error())
	}

	return &NotificationService{
		cron:            cron,
		si:              si,
		bot:             bot,
		errBot:          errBot,
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
	if now.Hour() >= conf.StartTime {
		jobStart = jobStart.Add(24 * time.Hour)
	}
	// //  вернуть нормальное время запуска
	// jobStart := now.Add(1 * time.Minute)
	logger.Info("starting jobs time " + jobStart.Format("02.01.2006 15:04:05"))

	job := gocron.DurationJob(conf.Interval)
	// task := gocron.NewTask(s.Send, conf.Times)
	task := gocron.NewTask(s.Check, conf.Times)
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

func (s *NotificationService) Check(times []models.NotificationTime) {
	s.CheckSendSI()
	s.CheckNotificationTime(times)
}

func (s *NotificationService) CheckSendSI() {
	logger.Debug("CheckSendSI")
	//TODO есть проблема. уведомления будут отправляться каждый день пока не подтвердят, что наверное не очень хорошо
	nots, err := s.si.GetForNotification(context.Background(), models.Period{})
	if err != nil {
		logger.Error("notification error:", logger.ErrAttr(err))
		s.errBot.Send(context.Background(), bot.Data{Error: err.Error(), Request: nil, Url: "notification bot. get si list (checkSend)"})
		return
	}

	for _, n := range nots {
		if n.MostId == "" {
			continue
		}

		n.Message = "Подтвердите получение инструментов"
		if n.Status == constants.LocationStatusReserve && n.ChannelId != "" {
			n.MostId = ""
		}

		if err := s.bot.Send(context.Background(), n); err != nil {
			logger.Error("notification error:", logger.ErrAttr(err))
			s.errBot.Send(context.Background(), bot.Data{Error: err.Error(), Request: n, Url: "notification bot. send to bot (checkSend)"})

		}
	}
}

// можно с go cron каждый день вызывать определенную функцию которая будет отправлять уведомления
// в функции будет текущая дата сравниваться с ожидаемой (либо задана, либо вычисляется по заданному условию) и если сравнение не проходит функция дальше не идет

func (s *NotificationService) CheckNotificationTime(times []models.NotificationTime) {
	index := s.iterationNumber % len(times)
	logger.Debug("job started ", index)

	notificationTime := times[index]

	now := time.Now()
	// возможно часы надо все-таки обнулить (как бы ошибок не было из-за часов)
	monthEnd := time.Date(now.Year(), now.Month()+1, 0, now.Hour(), now.Minute(), now.Second(), now.Nanosecond(), now.Location())
	if s.iterationNumber >= len(times) {
		monthEnd = time.Date(now.Year(), now.Month()+2, 0, now.Hour(), now.Minute(), now.Second(), now.Nanosecond(), now.Location())
	}

	//? задача в cron запускается 1 раз в сутки. текущая дата сравнивается с расчетной и если текущая дата >=, то индекс переключается.
	// поскольку следующая дата высчитывается на основе предыдущей сделан массив в который записывается все рассчитанные даты.

	switch notificationTime.Type {
	case "sub":
		date := monthEnd.Add(-notificationTime.Sub)
		s.dates[index] = date

		logger.Debug("index ", index, " date ", date.Format("02.01.2006 15:04:05"))
	case "add":
		start := now
		if index > 0 && s.dates[index-1].Year() > 1 {
			start = s.dates[index-1]
		}
		date := start.Add(notificationTime.Add)
		s.dates[index] = date

		logger.Debug("index ", index, " date ", date.Format("02.01.2006 15:04:05"))
	case "date":
		date := time.Date(now.Year(), now.Month(), 0, 0, 0, 0, 0, now.Location()).Add(notificationTime.Date)
		s.dates[index] = date

		logger.Debug("index ", index, " date ", date.Format("02.01.2006 15:04:05"))
	}

	// logger.Debug("dates ", s.dates[index])
	// logger.Debug("is before ", s.dates[index].Before(time.Now()))

	if !s.dates[index].Before(time.Now()) {
		return
	}

	logger.Debug("after")

	startAt := time.Date(now.Year(), now.Month()+1, 1, 0, 0, 0, 0, now.Location())
	finishAt := time.Date(now.Year(), now.Month()+2, 0, 0, 0, 0, 0, now.Location())

	// убрать преобразование в строку
	period := models.Period{
		// StartAt:  startAt.Format("02.01.2006"),
		// FinishAt: finishAt.Format("02.01.2006"),
		StartAt:  startAt.Unix(),
		FinishAt: finishAt.Unix(),
	}

	// logger.Debug("period ", period)

	si, err := s.si.GetForNotification(context.Background(), period)
	if err != nil {
		logger.Error("notification error:", logger.ErrAttr(err))
		s.errBot.Send(context.Background(), bot.Data{Error: err.Error(), Request: period, Url: "notification bot"})
		return
	}

	for _, n := range si {
		if n.MostId == "" {
			continue
		}

		term := monday.Format(monthEnd.Add(-notificationTime.Time), "Mon 2 Jan 2006", monday.LocaleRuRU)
		if now.Equal(monthEnd.Add(-notificationTime.Time)) {
			term += " (Сегодня)"
		}
		n.Message = "Необходимо сдать инструменты до `" + term + "`"

		if err := s.bot.Send(context.Background(), n); err != nil {
			logger.Error("notification error:", logger.ErrAttr(err))
			s.errBot.Send(context.Background(), bot.Data{Error: err.Error(), Request: n, Url: "notification bot"})
		}
	}

	if s.iterationNumber >= len(times) {
		s.iterationNumber = index
	}
	s.iterationNumber = (index + 1)
}

func (s *NotificationService) Send(times []models.NotificationTime) {
	index := s.iterationNumber % len(times)
	logger.Debug("job started ", index)

	notificationTime := times[index]

	now := time.Now()
	monthEnd := time.Date(now.Year(), now.Month()+1, 0, now.Hour(), now.Minute(), now.Second(), now.Nanosecond(), now.Location())

	//? задача в cron запускается 1 раз в сутки. текущая дата сравнивается с расчетной и если текущая дата >=, то индекс переключается.
	// поскольку следующая дата высчитывается на основе предыдущей сделан массив в который записывается все рассчитанные даты.

	switch notificationTime.Type {
	case "sub":
		// возможно часы надо все-таки обнулить (как бы ошибок не было из-за часов)
		date := monthEnd.Add(-notificationTime.Sub)
		s.dates[index] = date

		logger.Debug("index ", index, " date ", date.Format("02.01.2006 15:04:05"))
	case "add":
		start := now
		if index > 0 && s.dates[index-1].Year() > 1 {
			start = s.dates[index-1]
		}
		date := start.Add(notificationTime.Add)
		s.dates[index] = date

		logger.Debug("index ", index, " date ", date.Format("02.01.2006 15:04:05"))
	case "date":
		date := time.Date(now.Year(), now.Month(), 0, 0, 0, 0, 0, now.Location()).Add(notificationTime.Date)
		s.dates[index] = date

		logger.Debug("index ", index, " date ", date.Format("02.01.2006 15:04:05"))
	}

	if !s.dates[index].Before(time.Now()) {
		return
	}

	logger.Info("after")

	startAt := time.Date(now.Year(), now.Month()+1, 1, 0, 0, 0, 0, now.Location())
	finishAt := time.Date(now.Year(), now.Month()+2, 0, 0, 0, 0, 0, now.Location())

	period := models.Period{
		// StartAt:  startAt.Format("02.01.2006"),
		// FinishAt: finishAt.Format("02.01.2006"),
		StartAt:  startAt.Unix(),
		FinishAt: finishAt.Unix(),
	}

	si, err := s.si.GetForNotification(context.Background(), period)
	if err != nil {
		logger.Error("notification error:", logger.ErrAttr(err))
		s.errBot.Send(context.Background(), bot.Data{Error: err.Error(), Request: period, Url: "notification bot"})
		return
	}

	for _, n := range si {
		if n.MostId == "" {
			continue
		}

		term := monday.Format(monthEnd.Add(-notificationTime.Time), "Mon 2 Jan 2006", monday.LocaleRuRU)
		if now.Equal(monthEnd.Add(-notificationTime.Time)) {
			term += " (Сегодня)"
		}

		n.Message = "Необходимо сдать инструменты до `" + term + "`"

		if n.Status == constants.LocationStatusReserve && n.ChannelId != "" {
			n.MostId = ""
		}
		if err := s.bot.Send(context.Background(), n); err != nil {
			logger.Error("notification error:", logger.ErrAttr(err))
			s.errBot.Send(context.Background(), bot.Data{Error: err.Error(), Request: n, Url: "notification bot"})

		}
	}

	s.iterationNumber = index + 1
}
