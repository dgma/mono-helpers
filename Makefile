-include .env

.PHONY: init build clear lint typecheck test pre-commit pre-push dev list wallet tx

all: init clean typecheck test

init:; npm i

typecheck :; npx tsc --project tsconfig.json

clean :; rm -rf dist

lint :; npx eslint src/**/*.ts

lint-stg :; npx lint-staged

test :; npx jest --passWithNoTests

pre-commit: typecheck lint-stg
pre-push : lint typecheck test

dev :; npx tsx src/cli/$(cmd).ts

migrate :; npx tsx src/migrations/$(cmd).ts

# commands
list :; node --import tsx/esm src/cli/list.ts

profiles :; node --import tsx/esm src/cli/profiles.ts

recover :; node --import tsx/esm src/cli/recover.ts

fuel :; node --import tsx/esm src/cli/fuel.ts

report :; node --import tsx/esm src/cli/report.ts

-include ${FCT_PLUGIN_PATH}/makefile-external