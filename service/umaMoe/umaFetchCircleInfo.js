import { configDotenv } from "dotenv";

configDotenv();

async function getData(circleName, leaderId) {
  const data = await fetch(
    `https://uma.moe/api/v4/circles/list?page=0&name=${circleName}&query=${leaderId}&limit=20`,
    {
      method: "GET",
      headers: new Headers({
        "X-API-key": process.env.UMA_TOKEN,
      }),
    },
  );

  return data.json();
}

export default async function umaFetchCircleInfo(circleName, leaderId) {
  const rawData = await getData(circleName, leaderId);

  if (rawData.circles.length == 0) {
    return null;
  }

  const arr = [];

  for (const item of rawData.circles) {
    const circleData = {
      name: item.name,
      memberCount: item.member_count,
      rank: item.live_rank,
      circleId: item.circle_id,
      circleFans: item.live_points,
      leaderName: item.leade_name,
    };

    arr.push(circleData);
  }

  arr.sort((a, b) => a.rank - b.rank);

  return arr;
}
