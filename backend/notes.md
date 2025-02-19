goose -dir internal/migrate/postgres/migrations postgres "postgresql://postgres:postgres@127.0.0.1:5436/si_accounting?sslmode=disable" down
goose -dir internal/migrate/postgres/migrations create new_table sql
scp -r ./dist administrator@route:/home/administrator/apps/si_accounting
npx vite-bundle-visualizer
