-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS public.verification_history
(
    id uuid NOT NULL,
    instrument_id uuid NOT NULL,
    file_link text COLLATE pg_catalog."default" DEFAULT ''::text,
    register_link text COLLATE pg_catalog."default" DEFAULT ''::text,
    status text COLLATE pg_catalog."default" DEFAULT ''::text,
    date integer NOT NULL DEFAULT 0,
    next_date integer DEFAULT 0,
    notes text COLLATE pg_catalog."default" DEFAULT ''::text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT verification_history_pkey PRIMARY KEY (id),
    CONSTRAINT verification_history_instrument_id_fkey FOREIGN KEY (instrument_id)
        REFERENCES public.instruments (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.verification_history
    OWNER to postgres;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS public.verification_history;
-- +goose StatementEnd
