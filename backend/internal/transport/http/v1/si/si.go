package si

import "github.com/gin-gonic/gin"

type SIHandlers struct {
}

func NewSIHandlers() *SIHandlers {
	return &SIHandlers{}
}

func Register(api *gin.RouterGroup) {
	api.GET("/")
}
