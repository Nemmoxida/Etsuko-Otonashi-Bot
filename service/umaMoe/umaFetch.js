import { configDotenv } from "dotenv";
import fs from "fs";
import path from "path";

configDotenv();
const __dirname = import.meta.dirname;

// get data from source
async function getData(circleId) {
  const data = await fetch(
    `https://uma.moe/api/v4/circles?circle_id=${circleId}`,
    {
      method: "GET",
      headers: new Headers({
        "X-API-key": process.env.UMA_TOKEN,
      }),
    },
  );

  return data.json();
}

export default async function umaFetch(circleId, quotaCircle) {
  const circleDataRaw = await getData(circleId);
  const date = new Date().getDate(); // used for calculation
  const quota = quotaCircle; // every quota will be different depending on the club

  const circleData = circleDataRaw.members
    .map((item) => {
      let cumulativeFanGains = 0; // placeholder for total fans in the current month

      /**
       * the way the api handle a new player that just joined the club is that it will gives minus or zero before the actuall record (daily_fans) aka the date that the player joined
       * so we detect if that player record has it and then slice the data to only include positive start
       * search for positive from index 0 and if it finds a positive then it will slice it from that index
       * because the rest will guaranted to be positive, so no need further search
       */
      if (item.daily_fans.some((num) => num < 0) || item.daily_fans[0] == 0) {
        for (const data in item.daily_fans) {
          if (item.daily_fans[data] > 0) {
            // target will check if the api has update the record for today, if not (the resuilt will be zero) then it will take from the previous day
            const target =
              item.daily_fans[date] != 0
                ? item.daily_fans[date]
                : item.daily_fans[date - 1];
            cumulativeFanGains = target - item.daily_fans[data];

            break;
          }
        }
      } else {
        // normal operation for player that don't have minus record
        // same as above
        const target =
          item.daily_fans[date] != 0
            ? item.daily_fans[date]
            : item.daily_fans[date - 1];
        cumulativeFanGains = target - item.daily_fans[0];
      }

      /** the api still return data for former member of the club
       * so we handle it by checking if today or yesterday record
       * if it's zero then the player is no longer a member, return null
       *
       */
      if (item.daily_fans[date] == 0 && item.daily_fans[date - 1] == 0) {
        return;
      }

      return {
        name: item.trainer_name.replace("　", " ").normalize("NFKC"),
        daily: item.daily_fans[date - 1] - item.daily_fans[date - 2],
        plus: cumulativeFanGains - quota * date,
        totalThisMonth: cumulativeFanGains,
        avrg: (cumulativeFanGains / date).toFixed(0),
        total: item.daily_fans[date - 1],
      };
    })
    .filter((x) => x != null); // filter to remove former member

  circleData.sort((a, b) => b.totalThisMonth - a.totalThisMonth); // sort descending by totalThisMonth

  return circleData;

  // FOR TESTING PURPOSE
  // dump cleaned file to a json file
  // fs.writeFileSync(
  //   path.join(__dirname, "cleanedCircleData.json"),
  //   JSON.stringify(circleData),
  // );
}
