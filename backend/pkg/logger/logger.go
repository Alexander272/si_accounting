package logger

import (
	"time"
)

type Logger interface {
	Trace(msg string, params map[string]interface{})
	Debug(msg string, params map[string]interface{})
	Info(msg string, fields ...Field)
	Error(msg string, params map[string]interface{})
	Fatal(msg string, params map[string]interface{})
}

// type Field = logrus.Fields
type Field struct {
	Key   string
	Value interface{}
}

func StringAttr(key, value string) Field {
	return Field{Key: key, Value: value}
}
func IntAttr(key string, value int) Field {
	return Field{Key: key, Value: value}
}
func FloatAttr(key string, value float64) Field {
	return Field{Key: key, Value: value}
}
func ErrorAttr(err error) Field {
	return Field{Key: "error", Value: err.Error()}
}
func TimeAttr(key string, value time.Time) Field {
	return Field{Key: key, Value: value}
}
