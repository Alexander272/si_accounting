package services

import "fmt"

type NotificationService struct {
}

func NewNotificationService() *NotificationService {
	return &NotificationService{}
}

type Notification interface {
}

func (s *NotificationService) Start() error {
	//? запуск крона каждый день
	// задать условия при выполнении которых будет вызывать функция отправки уведомления
	// условия похоже надо задавать массивом и как-то переключаться между элементами
	// задать индекс, увеличивать его после каждого вызова и брать остаток от деления на длину массива

	return fmt.Errorf("not implemented")
}
