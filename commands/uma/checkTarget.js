import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { EmbedBuilder } from "discord.js";
import db from "../../db/db.js";
import fetchUserId from "../../service/umaMoe/umaFetchUser.js";
import { shortenNumber } from "../../service/umaMoe/table.js";

export const data = new SlashCommandBuilder()
  .setName("check-target")
  .setDescription("Check your current fans target")
  .addStringOption((option) =>
    option
      .setName("is-public")
      .setDescription(
        "by default the message will be public. if you want the message to be only seen by you type 0",
      )
      .setRequired(false),
  );

export async function execute(interaction) {
  const data = db
    .prepare("SELECT * FROM user_target WHERE discord_id == ?")
    .get(interaction.user.id);

  if (data == undefined) {
    return await interaction.reply({
      content: "No target for your account is found...",
      flags: MessageFlags.Ephemeral,
    });
  }

  const userData = await fetchUserId(data.game_id);

  const embed = new EmbedBuilder()
    .setTitle("Target Info ℹ️")
    .setColor("Aqua")
    .setThumbnail(
      "https://i.pinimg.com/736x/86/a0/bf/86a0bfd5939fddbc9482cac97099d1f3.jpg",
    )
    .setDescription(
      `Called by: <@${data.discord_id}>\nAccount name: **${userData.name}**`,
    );

  embed.addFields({
    name: "Current Stat",
    value: `1. Total this month: **${shortenNumber(userData.monthlyGain)}**\n2. Total: **${shortenNumber(userData.total_fans)}**`,
    inline: true,
  });
  embed.addFields({
    name: "Target",
    value: `1. Target set: **${shortenNumber(data.target)}**\n2. Deadline set: **${data.deadline} ${new Date().toLocaleString("en-ID", { month: "long" })}**`,
    inline: true,
  });

  const targetResult = data.target - userData.monthlyGain;
  const dateDiff = Math.abs(new Date().getDate() - data.target);

  //
  if (targetResult > 0) {
    embed.addFields({
      name: "Result",
      value: `1. Fans minus: **-${shortenNumber(targetResult)}**\n2. Minimum per day req:  **${shortenNumber(Math.abs(targetResult / dateDiff))}**`,
      inline: false,
    });
  } else {
    embed.setThumbnail(
      "https://i.pinimg.com/736x/5a/f4/91/5af4914963debcc94fa2affe68194107.jpg",
    );
    embed.addFields({
      name: "Result",
      value:
        "\n\n                                           **Target has been reached**\n                                          🎉  **Congratulations**  🎉",
      inline: false,
    });
  }

  const isPublic = interaction.options.getString("is-public") || 1;
  console.log(isPublic);

  if (isPublic == 0) {
    return await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  }

  await interaction.reply({ embeds: [embed] });
}
