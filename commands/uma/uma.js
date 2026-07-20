import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { EmbedBuilder } from "discord.js";
import umaFetch from "../../service/umaMoe/umaFetch.js";
import createTableUma from "../../service/umaMoe/table.js";
import { shortenNumber } from "../../service/umaMoe/table.js";
import db from "../../db/db.js";
import clubData from "../../service/umaMoe/cleanedCircleData.json" with { type: "json" };

export const data = new SlashCommandBuilder()
  .setName("fetch-club")
  .setDescription("Return fans record of a club");

// fetching the coresponding circleId to uma.moe API
const circleData = async (circleId, quota) => {
  return await umaFetch(circleId, quota);
};

// creating table for leaderboard
async function createTableData(data) {
  const table = await createTableUma(await data);

  return await table;
}

export async function execute(interaction) {
  // get circle id based from channel id and then doing query to get circle id and the quota
  const channelId = interaction.channelId;
  const circleTargetStatement = db.prepare(
    "SELECT * FROM circle_list WHERE channel_id == ?",
  );
  const circleTarget = circleTargetStatement.get(channelId);

  // check if channelId is registered to a circleId
  if (circleTarget == undefined) {
    return await interaction.reply({
      content: "No circle has been set for this channel",
      flags: MessageFlags.Ephemeral,
    });
  }

  const timeUnix = Math.floor(Date.now() / 1000); // used for creating discord timestamp. discord timestamp don't use milisecond so we remove it
  const data = circleData(circleTarget.circle_id, circleTarget.quota);
  const finalData = await createTableData(data);
  const date = new Date().getDate(); // used for certain calculation like Today's target and average

  // embed is for players who manage to get above quota
  const embed = new EmbedBuilder()
    .setColor("#0062ff")
    .setTitle("Leader Board")
    .setDescription("```" + finalData[0] + "```");

  // embed2 is for players who managet to get below quota
  const embed2 = new EmbedBuilder()
    .setColor("#ff0000")
    .setTitle("Below Quota")
    .setDescription("```" + finalData[1] + "```")
    .addFields({
      name: "",
      value: `Data as of <t:${timeUnix}:F> from uma.moe`,
    });

  // overview for the club
  // shortenNumber is a function imported from table.js. as the name implied
  // it shortenNumber to 1 decimal or more and give a unit like k, m, and b so that it is easier to read
  const reportEmbed = new EmbedBuilder()
    .setColor("Yellow")
    .setTitle("Circle data report")
    .addFields({
      name: "👑Top 3",
      value: `1. ${clubData[0].name}\n2. ${clubData[1].name}\n3. ${clubData[2].name}`,
      inline: true,
    })
    .addFields({
      name: "Top 3 from behind",
      value: `1. ${clubData[clubData.length - 1].name}\n2. ${clubData[clubData.length - 2].name}\n3. ${clubData[clubData.length - 3].name}`,
      inline: true,
    })
    .addFields({
      name: "Today Report",
      value: `Total Gain: ${shortenNumber(clubData.reduce((acc, item) => (acc += item.daily), 0))}\nTotal This month: ${shortenNumber(
        clubData.reduce((acc, item) => (acc += item.totalThisMonth), 0),
        3,
      )} \nAverage: ${shortenNumber(clubData.reduce((acc, item) => (acc += item.totalThisMonth), 0) / date)} \nToday's Target: ${shortenNumber(circleTarget.quota * date)}`,
      inline: true,
    })
    .addFields({
      name: "Members Report",
      value: `🟢Above Quota: ${finalData[2]}\n🟡Below Quota: ${finalData[3]}`,
      inline: true,
    })
    .setThumbnail(
      "https://i.pinimg.com/736x/f8/16/c0/f816c01a46b2cf7deb6312b6246280de.jpg",
    )
    .setTimestamp();

  const replyEmbeds = [];

  /**
   * Certain club can have all members to get above average or vice versa
   * so if the table for embed or embed2 is not empty it will get pushed to reply embeds and sent by the bot
   */
  if (finalData[0]) {
    replyEmbeds.push(embed);
  }
  if (finalData[1]) {
    replyEmbeds.push(embed2);
  }
  replyEmbeds.push(reportEmbed);

  await interaction.reply({ embeds: replyEmbeds });
}
