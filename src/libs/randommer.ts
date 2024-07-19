import { AxiosInstance } from "axios";
import { getAppConf } from "src/libs/configs";

export const getName = async (axios: AxiosInstance) => {
  const { data } = await axios.get<string>("https://randommer.io/api/Name?nameType=firstname&quantity=1", {
    headers: {
      "X-Api-Key": (await getAppConf()).randommer.keyᵻ,
    },
  });
  return data;
};
