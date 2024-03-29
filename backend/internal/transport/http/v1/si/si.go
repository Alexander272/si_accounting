package si

import (
	"net/http"
	"strconv"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/models/response"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/api/error_bot"
	"github.com/gin-gonic/gin"
)

type SIHandlers struct {
	service      services.SI
	errBot       error_bot.ErrorBotApi
	formatFields map[string]string
}

func NewSIHandlers(service services.SI, errBot error_bot.ErrorBotApi) *SIHandlers {
	format := make(map[string]string)

	format["name"] = "name"
	format["type"] = "type"
	format["factoryNumber"] = "factory_number"
	format["measurementLimits"] = "measurement_limits"
	format["accuracy"] = "accuracy"
	format["stateRegister"] = "state_register"
	format["manufacturer"] = "manufacturer"
	format["yearOfIssue"] = "year_of_issue"
	format["interVerificationInterval"] = "inter_verification_interval"
	format["notes"] = "notes"
	format["verificationDate"] = "date"
	format["nextVerificationDate"] = "next_date"
	format["place"] = "place"

	return &SIHandlers{
		service:      service,
		errBot:       errBot,
		formatFields: format,
	}
}

func Register(api *gin.RouterGroup, service services.SI, errBot error_bot.ErrorBotApi) {
	handlers := NewSIHandlers(service, errBot)

	api.GET("", handlers.GetAll)
	api.POST("/save", handlers.Save)
}

func (h *SIHandlers) GetAll(c *gin.Context) {
	params := models.SIParams{}

	page := c.Query("page")
	// TODO стоит переименовать count на size
	count := c.Query("count")

	limit, err := strconv.Atoi(count)
	if err != nil {
		params.Page.Limit = 15
	} else {
		params.Page.Limit = limit

	}

	p, err := strconv.Atoi(page)
	if err != nil {
		params.Page.Offset = 0
	} else {
		params.Page.Offset = (p - 1) * params.Page.Limit
	}

	//TODO стоит переименовать поля не sortBY. также можно в нем передавать несколько полей через запятую и указывать порядок, например, при сортировке по убыванию добавлять в перед названием поля минус
	sortField := c.Query("s-field")
	sortType := c.Query("s-type")

	if sortField != "" && sortType != "" {
		t := "ASC"
		if sortType != "ASC" {
			t = "DESC"
		}

		params.Sort = models.SISort{
			Field: h.formatFields[sortField],
			Type:  t,
		}
	}

	//TODO все эти поля тоже стоит как-нибудь поправить, тк это и выглядит плохо и пользоваться этим не удобно. стоит посмотреть в инете как правильно писать фильтры
	filterField := c.Query("f-field")
	filterFieldType := c.Query("f-fieldType")
	filterType := c.Query("f-compareType")
	filterValue1 := c.Query("f-valueStart")
	filterValue2 := c.Query("f-valueEnd")

	if filterField != "" && filterType != "" {
		params.Filter = models.SIFilter{
			Field:       h.formatFields[filterField],
			FieldType:   filterFieldType,
			CompareType: filterType,
			Values:      []string{filterValue1, filterValue2},
		}
	}

	si, err := h.service.GetAll(c, params)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		h.errBot.Send(c, err.Error(), params)
		return
	}

	c.JSON(http.StatusOK, response.DataResponse{Data: si.SI, Total: si.Total})
}

// func (h *SIHandlers) GetIdentifiers(c *gin.Context) {

// }

func (h *SIHandlers) Save(c *gin.Context) {
	var dto models.UpdateStatus
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	if err := h.service.Save(c, dto.Id); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		h.errBot.Send(c, err.Error(), dto)
		return
	}
	c.JSON(http.StatusOK, response.IdResponse{Message: "Данные о си успешно сохранены"})
}
