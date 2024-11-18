package services

import (
	"bytes"
	"context"
	"fmt"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/xuri/excelize/v2"
)

type FileService struct {
	si SI
}

func NewFileService(si SI) *FileService {
	return &FileService{
		si: si,
	}
}

type File interface {
	Export(context.Context, *models.SIParams) (*bytes.Buffer, error)
	MakeVerificationSchedule(context.Context, *models.SIParams) (*bytes.Buffer, error)
}

func (s *FileService) Export(ctx context.Context, params *models.SIParams) (*bytes.Buffer, error) {
	data, err := s.si.GetAll(ctx, params)
	if err != nil {
		return nil, err
	}

	file := excelize.NewFile()
	sheetName := file.GetSheetName(file.GetActiveSheetIndex())

	headerStyle, err := file.NewStyle(&excelize.Style{
		Border: []excelize.Border{
			{Type: "top", Style: 1, Color: "#000000"},
			{Type: "bottom", Style: 1, Color: "#000000"},
			{Type: "left", Style: 1, Color: "#000000"},
			{Type: "right", Style: 1, Color: "#000000"},
		},
		Alignment: &excelize.Alignment{
			WrapText:   true,
			Horizontal: "center",
		},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create header style. error: %w", err)
	}

	mainStyle, err := file.NewStyle(&excelize.Style{
		Border: []excelize.Border{
			{Type: "top", Style: 1, Color: "#000000"},
			{Type: "bottom", Style: 1, Color: "#000000"},
			{Type: "left", Style: 1, Color: "#000000"},
			{Type: "right", Style: 1, Color: "#000000"},
		},
		Alignment: &excelize.Alignment{
			WrapText: true,
			Vertical: "center",
		},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create main style. error: %w", err)
	}

	columnNames := []string{
		"Наименование", "Тип СИ", "Заводской номер", "Пределы измерений", "Точность, цена деления, погрешность", "Госреестр СИ", "Изготовитель",
		"Год выпуска", "Дата поверки (калибровки)", "Межповерочный интервал", "Следующая поверка (калибровка)", "Место нахождения", "ФИО Сотрудника", "Примечание",
	}
	if err := file.SetSheetRow(sheetName, "A1", &columnNames); err != nil {
		return nil, fmt.Errorf("failed to set header row. error: %w", err)
	}

	endColumn, err := excelize.ColumnNumberToName(len(columnNames))
	if err != nil {
		return nil, fmt.Errorf("failed to get column name. error: %w", err)
	}

	if err := file.SetColWidth(sheetName, "A", endColumn, 25); err != nil {
		return nil, fmt.Errorf("failed to set column width. error: %w", err)
	}
	if err = file.SetCellStyle(sheetName, "A1", endColumn+"1", headerStyle); err != nil {
		return nil, fmt.Errorf("failed to set header style. error: %w", err)
	}

	for i, d := range data.SI {
		values := []interface{}{
			d.Name, d.Type, d.FactoryNumber, d.MeasurementLimits, d.Accuracy, d.StateRegister, d.Manufacturer, d.YearOfIssue, d.Date,
			d.InterVerificationInterval, d.NextDate, d.Place, d.Person, d.Notes,
		}

		if err := file.SetSheetRow(sheetName, fmt.Sprintf("A%d", i+2), &values); err != nil {
			return nil, fmt.Errorf("failed to set header row. error: %w", err)
		}
		if err = file.SetCellStyle(sheetName, fmt.Sprintf("A%d", i+2), fmt.Sprintf("%s%d", endColumn, i+2), mainStyle); err != nil {
			return nil, fmt.Errorf("failed to set style. error: %w", err)
		}
	}

	// if err := file.SaveAs("test.xlsx"); err != nil {
	// 	return nil, fmt.Errorf("failed to save file. error: %w", err)
	// }
	// logger.Debug(file.ContentTypes.Defaults)

	buffer, err := file.WriteToBuffer()
	if err != nil {
		return nil, fmt.Errorf("failed to write to buffer. error: %w", err)
	}

	return buffer, nil
}

func (s *FileService) MakeVerificationSchedule(ctx context.Context, params *models.SIParams) (*bytes.Buffer, error) {
	data, err := s.si.GetAll(ctx, params)
	if err != nil {
		return nil, err
	}

	file := excelize.NewFile()
	sheetName := file.GetSheetName(file.GetActiveSheetIndex())

	headerStyle, err := file.NewStyle(&excelize.Style{
		Border: []excelize.Border{
			{Type: "top", Style: 1, Color: "#000000"},
			{Type: "bottom", Style: 1, Color: "#000000"},
			{Type: "left", Style: 1, Color: "#000000"},
			{Type: "right", Style: 1, Color: "#000000"},
		},
		Alignment: &excelize.Alignment{
			WrapText:   true,
			Horizontal: "center",
		},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create header style. error: %w", err)
	}

	mainStyle, err := file.NewStyle(&excelize.Style{
		Border: []excelize.Border{
			{Type: "top", Style: 1, Color: "#000000"},
			{Type: "bottom", Style: 1, Color: "#000000"},
			{Type: "left", Style: 1, Color: "#000000"},
			{Type: "right", Style: 1, Color: "#000000"},
		},
		Alignment: &excelize.Alignment{
			WrapText: true,
			Vertical: "center",
		},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create main style. error: %w", err)
	}

	columnNames := []string{
		"№ п/п", "Наименование", "Заводской номер", "Диапазон измерений", "Периодичность поверки", "Дата последней поверки",
		"Дата следующей поверки", "Примечание",
	}
	if err := file.SetSheetRow(sheetName, "A1", &columnNames); err != nil {
		return nil, fmt.Errorf("failed to set header row. error: %w", err)
	}

	endColumn, err := excelize.ColumnNumberToName(len(columnNames))
	if err != nil {
		return nil, fmt.Errorf("failed to get column name. error: %w", err)
	}

	if err := file.SetColWidth(sheetName, "A", endColumn, 25); err != nil {
		return nil, fmt.Errorf("failed to set column width. error: %w", err)
	}
	if err = file.SetCellStyle(sheetName, "A1", endColumn+"1", headerStyle); err != nil {
		return nil, fmt.Errorf("failed to set header style. error: %w", err)
	}

	for i, d := range data.SI {
		values := []interface{}{
			i + 1, d.Name, d.FactoryNumber, d.MeasurementLimits, d.InterVerificationInterval, d.Date, d.NextDate, d.Notes,
		}

		if err := file.SetSheetRow(sheetName, fmt.Sprintf("A%d", i+2), &values); err != nil {
			return nil, fmt.Errorf("failed to set row. error: %w", err)
		}
		if err = file.SetCellStyle(sheetName, fmt.Sprintf("A%d", i+2), fmt.Sprintf("%s%d", endColumn, i+2), mainStyle); err != nil {
			return nil, fmt.Errorf("failed to set style. error: %w", err)
		}
	}

	buffer, err := file.WriteToBuffer()
	if err != nil {
		return nil, fmt.Errorf("failed to write to buffer. error: %w", err)
	}

	return buffer, nil
}
