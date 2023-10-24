package services

import "context"

type SIService struct {
	instrument   Instrument
	verification Verification
	location     Location
}

func NewSIService(instrument Instrument, verification Verification, location Location) *SIService {
	return &SIService{
		instrument:   instrument,
		verification: verification,
		location:     location,
	}
}

type SI interface{}

// func (s *SIService) GetAll(ctx context.Context)

func (s *SIService) Save(ctx context.Context) error {}
