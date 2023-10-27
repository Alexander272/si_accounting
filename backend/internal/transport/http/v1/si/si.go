package si

import (
	"net/http"
	"strconv"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/models/response"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type SIHandlers struct {
	service      services.SI
	formatFields map[string]string
}

func NewSIHandlers(service services.SI) *SIHandlers {
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
		formatFields: format,
	}
}

func Register(api *gin.RouterGroup, service services.SI) {
	handlers := NewSIHandlers(service)

	api.GET("", handlers.GetAll)
	api.POST("/save", handlers.Save)
}

func (h *SIHandlers) GetAll(c *gin.Context) {
	params := models.SIParams{}

	page := c.Query("page")
	count := c.Query("count")

	limit, err := strconv.Atoi(count)
	if err != nil {
		params.Page.Limit = 50
	} else {
		params.Page.Limit = limit

	}

	p, err := strconv.Atoi(page)
	if err != nil {
		params.Page.Offset = 0
	} else {
		params.Page.Offset = (p - 1) * params.Page.Limit
	}

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

	filterField := c.Query("f-field")
	filterType := c.Query("f-compareType")
	filterValue1 := c.Query("f-valueStart")
	filterValue2 := c.Query("f-valueEnd")

	if filterField != "" && filterType != "" {
		params.Filter = models.SIFilter{
			Field:       h.formatFields[filterField],
			CompareType: filterType,
			Values:      []string{filterValue1, filterValue2},
		}
	}

	si, total, err := h.service.GetAll(c, params)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		// h.botApi.SendError(c, err.Error(), dto)
		return
	}

	c.JSON(http.StatusOK, response.DataResponse{Data: si, Total: total})
}

func (h *SIHandlers) Save(c *gin.Context) {
	var dto models.UpdateStatus
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	// response.NewErrorResponse(c, http.StatusInternalServerError, "test", "Произошла ошибка: "+"error: test")
	// return

	if err := h.service.Save(c, dto.Id); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		// h.botApi.SendError(c, err.Error(), dto)
		return
	}
	c.JSON(http.StatusOK, response.IdResponse{Message: "Данные о си успешно сохранены"})
}
