-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS public.si_movement_history
(
    id uuid NOT NULL,
    instrument_id uuid NOT NULL,
    date_of_receiving integer DEFAULT 0,
    date_of_issue integer DEFAULT 0,
    status text COLLATE pg_catalog."default" NOT NULL,
    person_id uuid,
    department_id uuid,
    place text COLLATE pg_catalog."default" DEFAULT ''::text,
    has_confirmed boolean DEFAULT false,
    need_confirmed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT si_movement_history_pkey PRIMARY KEY (id),
    CONSTRAINT si_movement_history_instrument_id_fkey FOREIGN KEY (instrument_id)
        REFERENCES public.instruments (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.si_movement_history
    OWNER to postgres;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS public.si_movement_history;
-- +goose StatementEnd
