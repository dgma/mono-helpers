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

migrate :; npx tsx src/migrations/$(script).ts

# cli
list :; npx tsx src/cli/list.ts

funding :; npx tsx src/cli/funding.ts

# prompts
propmpt :; npx tsx src/prompts/$(cmd).ts

-include ${FCT_PLUGIN_PATH}/makefile-external