-include .env

.PHONY: init build clear lint typecheck test pre-commit pre-push migrate up up-all list funding fuel report profiles recover decrypt encrypt

all: init clean typecheck test

init:; npm i

typecheck :; npx tsc --project tsconfig.json

clean :; rm -rf dist

lint :; npx eslint src/**/*.ts

lint-stg :; npx lint-staged

test :; npx jest --passWithNoTests

pre-commit: typecheck lint-stg
pre-push : lint typecheck test

migrate :; npx tsx src/migrations/$(script).ts

service?=fuel

up :; read -s -r -e -p "MASTER_KEY: " && echo $$REPLY > master_key && docker compose up -d $(service) && unset REPLY && docker compose logs -f $(service); rm -rf master_key

up-all :; read -s -r -e -p "MASTER_KEY: " && echo $$REPLY > master_key && docker compose up -d && unset REPLY && docker compose logs -f; rm -rf master_key
# cli
list :; npx tsx src/cli/list.ts

encrypt :; export FILE=$(file) && export BACKUP=$(backup) && export OUTPUT=$(output) && npx tsx src/cli/encrypt.ts && unset FILE && unset OUTPUT

decrypt :; export FILE=$(file) && export BACKUP=$(backup) && export OUTPUT=$(output) && npx tsx src/cli/decrypt.ts && unset FILE && unset OUTPUT

funding :; npx tsx src/cli/funding.ts

fuel :; npx tsx src/cli/fuel.ts

report :; npx tsx src/cli/report.ts

profiles :; npx tsx src/cli/profiles.ts

recover :; npx tsx src/cli/profiles.ts

-include ${FCT_PLUGIN_PATH}/makefile-external