import { tool } from "ai";
import { z } from "zod";

export const getWeather = tool({
  description: "获取某个地点的当前天气。你可以提供城市名称",
  inputSchema: z.object({
    city: z.string().describe("城市名称（例如：'上海'、日照'、'青岛'）").optional(),
  }),
  execute: async (input) => {
    if (!input.city) {
      return {
        error: "Please provide either a city name",
      };
    }

    const response = await fetch(
      `http://gfeljm.tianqiapi.com/api?unescape=1&version=v63&appid=12784242&appsecret=1GwF8Axa&city=${input.city}`
    );

    const weatherData = await response.json();
    if ("city" in input) {
      weatherData.cityName = input.city;
    }
    
    return weatherData;
  },
});
