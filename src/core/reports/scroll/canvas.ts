import { scroll } from "viem/chains";
import { CANVAS_ADDRESS, CANVAS_ABI } from "src/constants/canvas";
import { getPublicClient } from "src/libs/clients";

export const isProfileMinted = async (address: `0x${string}`) =>
  (await getPublicClient(scroll)).readContract({
    address: CANVAS_ADDRESS,
    abi: CANVAS_ABI,
    functionName: "isProfileMinted",
    args: [address],
  });
