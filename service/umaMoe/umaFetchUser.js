import { configDotenv } from "dotenv";

configDotenv();

async function fetchData(gameId) {
  const check = await fetch(`https://uma.moe/api/v4/user/profile/${gameId}`, {
    method: "GET",
    headers: new Headers({
      "X-API-key": process.env.UMA_TOKEN,
    }),
  });

  if (check.ok) {
    return check.json();
  } else {
    return false;
  }
}

export default async function fetchUserId(gameId) {
  const data = await fetchData(gameId);
  if (!data) {
    return false;
  }

  return {
    name: data.trainer.name,
    monthlyGain: data.fan_history.monthly[0].monthly_gain,
    total_fans: data.fan_history.monthly[0].total_fans,
  };
}
