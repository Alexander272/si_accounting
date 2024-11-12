package services

import (
	"context"
	"fmt"
	"time"

	"github.com/Alexander272/si_accounting/backend/internal/constants"
	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/models/bot"
	"github.com/Alexander272/si_accounting/backend/internal/services/error_bot"
	"github.com/Alexander272/si_accounting/backend/pkg/logger"
	"github.com/goodsign/monday"
)

type SINotificationService struct {
	si              SI
	bot             Most
	times           []*models.NotificationTime
	iterationNumber int
	dates           []time.Time
}

func NewSINotificationService(si SI, bot Most, times []*models.NotificationTime) *SINotificationService {
	return &SINotificationService{
		si:              si,
		bot:             bot,
		times:           times,
		iterationNumber: 0,
		dates:           make([]time.Time, len(times)),
	}
}

type SINotification interface {
	CheckSentSI()
	CheckUsedSI()
}

func (s *SINotificationService) CheckSentSI() {
	logger.Info("CheckSentSI")
	//TODO есть проблема. уведомления будут отправляться каждый день пока не подтвердят, что наверное не очень хорошо
	nots, err := s.si.GetForNotification(context.Background(), &models.Period{})
	if err != nil {
		logger.Error("notification error:", logger.ErrAttr(err))
		error_bot.Send(context.Background(), bot.Data{Error: err.Error(), Request: nil, Url: "Failed to get si list (checkSend)"})
		return
	}

	for _, n := range nots {
		if n.MostId == "" && n.ChannelId == "" {
			continue
		}

		if n.SI[0].Department != "" {
			n.Message = fmt.Sprintf("Подтвердите получение инструментов (%s)", n.SI[0].Department)
		} else {
			n.Message = "Подтвердите получение инструментов"
		}
		if n.Status == constants.LocationStatusReserve && n.ChannelId != "" {
			n.MostId = ""
		}

		if err := s.bot.Send(context.Background(), n); err != nil {
			logger.Error("notification error:", logger.ErrAttr(err))
			error_bot.Send(context.Background(), bot.Data{Error: err.Error(), Request: n, Url: "Failed to send to bot (checkSend)"})

		}
	}
}

func (s *SINotificationService) CheckUsedSI() {
	logger.Info("CheckUsedSI")
	index := s.iterationNumber % len(s.times)
	logger.Debug("CheckUsedSI", logger.IntAttr("time index", index))

	notificationTime := s.times[index]

	now := time.Now()
	// возможно часы надо все-таки обнулить (как бы ошибок не было из-за часов)
	// monthEnd := time.Date(now.Year(), now.Month()+1, 0, 0, 0, 0, 0, now.Location())
	monthEnd := time.Date(now.Year(), now.Month()+1, 0, now.Hour(), now.Minute(), now.Second(), now.Nanosecond(), now.Location())
	if s.iterationNumber >= len(s.times) {
		// monthEnd = time.Date(now.Year(), now.Month()+2, 0, 0, 0, 0, 0, now.Location())
		monthEnd = time.Date(now.Year(), now.Month()+2, 0, now.Hour(), now.Minute(), now.Second(), now.Nanosecond(), now.Location())
	}

	//? задача в cron запускается 1 раз в сутки. текущая дата сравнивается с расчетной и если текущая дата >=, то индекс переключается.
	// поскольку следующая дата высчитывается на основе предыдущей сделан массив в который записывается все рассчитанные даты.

	switch notificationTime.Type {
	case "sub":
		date := monthEnd.Add(-notificationTime.Sub)
		s.dates[index] = date

		logger.Debug("check", logger.IntAttr("index", index), logger.StringAttr("date", date.Format("02.01.2006 15:04:05")))
	case "add":
		start := now
		if index > 0 && s.dates[index-1].Year() > 1 {
			start = s.dates[index-1]
		}
		date := start.Add(notificationTime.Add)
		s.dates[index] = date

		logger.Debug("check", logger.IntAttr("index", index), logger.StringAttr("date", date.Format("02.01.2006 15:04:05")))
	case "date":
		date := time.Date(now.Year(), now.Month(), 0, 0, 0, 0, 0, now.Location()).Add(notificationTime.Date)
		s.dates[index] = date

		logger.Debug("check", logger.IntAttr("index", index), logger.StringAttr("date", date.Format("02.01.2006 15:04:05")))
	}

	// logger.Debug("dates ", s.dates[index])
	// logger.Debug("is before ", s.dates[index].Before(time.Now()))

	if !s.dates[index].Before(time.Now()) {
		return
	}

	logger.Debug("after")

	startAt := time.Date(now.Year(), now.Month()+1, 1, 0, 0, 0, 0, now.Location())
	finishAt := time.Date(now.Year(), now.Month()+2, 0, 0, 0, 0, 0, now.Location())

	period := &models.Period{
		StartAt:  startAt.Unix(),
		FinishAt: finishAt.Unix(),
	}

	si, err := s.si.GetForNotification(context.Background(), period)
	if err != nil {
		logger.Error("notification error:", logger.ErrAttr(err))
		error_bot.Send(context.Background(), bot.Data{Error: err.Error(), Request: period, Url: "Failed to get si for notification"})
		return
	}

	for _, n := range si {
		if n.MostId == "" && n.ChannelId == "" {
			continue
		}

		term := monday.Format(monthEnd.Add(-notificationTime.Time), "Mon 2 Jan 2006", monday.LocaleRuRU)
		if now.Equal(monthEnd.Add(-notificationTime.Time)) {
			// это перестанет работать, если я уберу время из monthEnd
			term += " (Сегодня)"
		}
		n.Message = "Необходимо сдать инструменты до `" + term + "`"

		if err := s.bot.Send(context.Background(), n); err != nil {
			logger.Error("notification error:", logger.ErrAttr(err))
			error_bot.Send(context.Background(), bot.Data{Error: err.Error(), Request: n, Url: "Failed to send to bot"})
		}
	}

	if s.iterationNumber >= len(s.times) {
		s.iterationNumber = index
	}
	s.iterationNumber = (index + 1)
}
