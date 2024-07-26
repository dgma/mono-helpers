import { AxiosInstance } from "axios";
import { Hex, hexToNumber, slice } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { Chain } from "viem/chains";
import { ERC_20_BASE_ABI } from "src/constants/erc20";
import { getClient } from "src/libs/clients";
import { logger } from "src/logger";
import { EVMWallet } from "src/types/configs";

export type PermitSignature = {
  r: Hex;
  s: Hex;
  v: number;
};

export type SignPermitProps = {
  /** Address of the token to approve */
  contractAddress: Hex;
  /** Address to grant allowance to */
  spenderAddress: Hex;
  /** Expiration of this approval, in SECONDS */
  deadline: bigint;
  /** Viem chain config */
  chain: Chain;
  /** Defaults to 1. Some tokens need a different version, check the [PERMIT INFORMATION](https://github.com/vacekj/wagmi-permit/blob/main/PERMIT.md) for more information */
  permitVersion?: string;
};

export type Eip2612Props = SignPermitProps & {
  /** Amount to approve */
  value: bigint;
  wallet: EVMWallet;
  axiosInstance?: AxiosInstance;
};

const types = {
  Permit: [
    { name: "owner", type: "address" },
    { name: "spender", type: "address" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
};

/**
 * Signs a permit for a given ERC-2612 ERC20 token using the specified parameters.
 */
export const signPermit = async ({
  contractAddress,
  spenderAddress,
  value,
  deadline,
  chain,
  permitVersion,
  axiosInstance,
  wallet,
}: Eip2612Props): Promise<PermitSignature> => {
  logger.debug(`sign ${value} to spend`, {
    label: "erc20/permit",
  });
  const client = await getClient(chain, axiosInstance);

  const contractConf = {
    address: contractAddress,
    abi: ERC_20_BASE_ABI,
  };

  const data = await client.multicall({
    contracts: [
      {
        ...contractConf,
        functionName: "name",
      },
      {
        ...contractConf,
        functionName: "nonces",
        args: [wallet.address],
      },
    ],
  });

  const erc20Name = data[0].result;
  const nonce = data[1].result;

  const domainData = {
    name: erc20Name,
    /** We assume 1 if permit version is not specified */
    version: permitVersion ?? "1",
    chainId: chain.id,
    verifyingContract: contractAddress,
  };

  const message = {
    owner: wallet.address,
    spender: spenderAddress,
    value,
    nonce,
    deadline,
  };

  const signature = await client.signTypedData({
    account: privateKeyToAccount(wallet.pkᵻ),
    message,
    domain: domainData,
    primaryType: "Permit",
    types,
  });

  logger.debug(`signature ${JSON.stringify(signature, (_, v) => (typeof v === "bigint" ? v.toString() : v))}`, {
    label: "erc20/permit",
  });
  const [r, s, v] = [slice(signature, 0, 32), slice(signature, 32, 64), slice(signature, 64, 65)];
  return { r, s, v: hexToNumber(v) };
};
