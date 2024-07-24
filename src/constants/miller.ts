export const MILLER_ABI = [
  { inputs: [{ internalType: "address", name: "target", type: "address" }], name: "AddressEmptyCode", type: "error" },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "AddressInsufficientBalance",
    type: "error",
  },
  { inputs: [], name: "FailedInnerCall", type: "error" },
  { inputs: [], name: "RecipientRevert", type: "error" },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "SafeERC20FailedOperation",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "address", name: "initiator", type: "address" }],
    name: "Distribute",
    type: "event",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "uint240", name: "amount", type: "uint240" },
          { internalType: "address", name: "to", type: "address" },
        ],
        internalType: "struct Miller.DistributionConfig[]",
        name: "config",
        type: "tuple[]",
      },
    ],
    name: "distribute",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "uint240", name: "amount", type: "uint240" },
          { internalType: "address", name: "to", type: "address" },
        ],
        internalType: "struct Miller.DistributionConfig[]",
        name: "config",
        type: "tuple[]",
      },
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint240", name: "permitAmount", type: "uint240" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
      { internalType: "uint8", name: "v", type: "uint8" },
      { internalType: "bytes32", name: "r", type: "bytes32" },
      { internalType: "bytes32", name: "s", type: "bytes32" },
    ],
    name: "distributeERC20",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint240", name: "amount", type: "uint240" },
      { internalType: "address[]", name: "to", type: "address[]" },
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint240", name: "permitAmount", type: "uint240" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
      { internalType: "uint8", name: "v", type: "uint8" },
      { internalType: "bytes32", name: "r", type: "bytes32" },
      { internalType: "bytes32", name: "s", type: "bytes32" },
    ],
    name: "distributeERC20Fixed",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint240", name: "amount", type: "uint240" },
      { internalType: "address[]", name: "to", type: "address[]" },
    ],
    name: "distributeFixed",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;
