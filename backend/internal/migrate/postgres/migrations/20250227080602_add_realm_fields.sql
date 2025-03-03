-- +goose Up
-- +goose StatementBegin
ALTER TABLE public.realms ADD has_responsible boolean NOT NULL DEFAULT true;
ALTER TABLE public.realms ADD need_responsible boolean NOT NULL DEFAULT true;
ALTER TABLE public.realms ADD need_confirmed boolean NOT NULL DEFAULT true;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE public.realms DROP COLUMN has_responsible;
ALTER TABLE public.realms DROP COLUMN need_responsible;
ALTER TABLE public.realms DROP COLUMN need_confirmed;
-- +goose StatementEnd
