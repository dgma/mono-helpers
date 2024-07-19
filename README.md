# Prompt based Web3 Helpers

- [Profile generator](docs/profile.md) for different chains.
- Reports:
  - Ethereum wallet balance on L1
  - [Scroll marks](https://scroll.io/sessions) & [NURI](https://www.nuri.exchange/swap) LP report
  - [Fuel Points](https://app.fuel.network/earn-points) farming with automatic ETH deposits
- OKX conditional withdrawal
- Fuel deposits

All available commands: `make list`

## Requirements

- Bash-like environment
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
  - You'll know you've done it right if you can run `git --version`
- [Node.js](https://nodejs.org/en) >= v20.x
- [Make](https://www.gnu.org/software/make/manual/make.html)
- Optional. [Docker](https://www.docker.com/)
  - You'll need to run docker if you want to use run production container builds locally

## Installation

1. Create a master_key and keep it secret outside of the app.

2. Install dependencies

```sh
make
```

3. Create .sercretsrc file:

```json
{
  "proxy": {
    "userᵻ": "xxxxxx",
    "passᵻ": "xxxxxx",
    "hostᵻ": "xxxxx",
    "portᵻ": "xxxxxx",
    "reboot-linkᵻ": "xxxxxx"
  },
  "rpc": {
    "alchemy": {
      "keyᵻ": "xxxxxxx"
    }
  },
  "okx": {
    "keyᵻ": "xxxxxxx",
    "secretᵻ": "xxxxxx",
    "passwordᵻ": "xxxxxxx"
  },
  "randommer": {
    "keyᵻ": "xxxxxxx"
  },
  "qnode": {
    "keyᵻ": "xxxxxxx"
  };
}
```

4. Encrypt dependencies

```sh
make encrypt-secrets
```

5. Generate or restore profiles with [Profile generator](docs/profile.md)

```sh
make profile
```

## Contributing

Contributions are always welcome! Open a PR or an issue!

Please look into makefile for commands
