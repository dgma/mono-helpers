import { scroll } from "viem/chains";
import { CANVAS_ADDRESS, CANVAS_ABI } from "src/constants/canvas";
import { getPublicClient } from "src/libs/clients";

export const isProfileMinted = async (address: `0x${string}`) => {
  const publicClient = await getPublicClient(scroll);
  const profile = await publicClient.readContract({
    address: CANVAS_ADDRESS,
    abi: CANVAS_ABI,
    functionName: "getProfile",
    args: [address],
  });
  return publicClient.readContract({
    address: CANVAS_ADDRESS,
    abi: CANVAS_ABI,
    functionName: "isProfileMinted",
    args: [profile],
  });
};
