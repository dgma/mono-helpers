# Profile generator

Generates profiles (wallets) for different networks. The result is stored in encrypted `.profiles` file. Decryption will generate the json:

```ts
type Networks = "btc" | "evm" | "sol" | "tia" | "atom";

type Profile = {
  [id: string]: {
    mnemonicᵻ: string; // encoded
    wallets: {
      [key in Networks]: {
        address: string;
        pkᵻ: string; // encoded
      };
    };
  };
};
```

## Supported networks and path

- btc, m/84'/0'/0'/0/0
- eth, m/44'/60'/0'/0
- atom, m/44'/118'/0'/0/0
- tia, m/44'/118'/0'/0/0
- sol, m/44'/501'/0'/0'

## Usage

Generate profiles

```sh
make profile
```

Recover profiles from mnemonics

1. Put .mnemonics.json in repository root with the following scheme:

```json
["first mnemonomic words...", "second mnemonomic words..."]
```

2. Run recover script

```sh
make recover
```

Decrypt

```sh
make decrypt in=clusters/main/.profiles out=clusters/main/.profiles.json
```
