SHELL := /bin/bash

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

# setup

encrypt-secrets :; export FILE=.secretsrc && export OUTPUT=.secrets && npx tsx src/cli/encrypt.ts && unset FILE && unset OUTPUT && rm -rf .secretsrc

# docker aliases

service?=fuel

up :; read -s -r -e -p "MASTER_KEY: " && echo $$REPLY > master_key && docker compose run --rm -d mono make $(cmd) && unset REPLY; rm -rf master_key

# cli
list :; npx tsx src/cli/list.ts

encrypt :; export FILE=$(in) && export OUTPUT=$(out) && npx tsx src/cli/encrypt.ts && unset FILE && unset OUTPUT

decrypt :; export FILE=$(in) && export OUTPUT=$(out) && npx tsx src/cli/decrypt.ts && unset FILE && unset OUTPUT

funding :; npx tsx src/cli/funding.ts

fuelNative :; npx tsx src/cli/fuelNative.ts

fuelERC :; npx tsx src/cli/fuelERC.ts

scroll-kelp :; npx tsx src/cli/scroll.kelp.ts

scroll-canvas :; npx tsx src/cli/scroll.canvas.ts

report :; npx tsx src/cli/report.ts

profiles :; npx tsx src/cli/profiles.ts

recover :; npx tsx src/cli/profiles.ts

distributeERC :; npx tsx src/cli/distributeERC.ts

distributeNative :; npx tsx src/cli/distributeNative.ts

-include ${FCT_PLUGIN_PATH}/makefile-external