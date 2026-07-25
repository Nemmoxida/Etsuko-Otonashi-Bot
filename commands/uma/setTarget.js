import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { EmbedBuilder } from "discord.js";
import fetchUserId from "../../service/umaMoe/umaFetchUser.js";
import db from "../../db/db.js";
import { shortenNumber } from "../../service/umaMoe/table.js";

export const data = new SlashCommandBuilder()
  .setName("set-target")
  .setDescription("Set this month fans target for n days forward")
  .addStringOption((option) =>
    option
      .setName("game-id")
      .setDescription("ingame id on profile card")
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("target")
      .setDescription("target for this month")
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("deadline")
      .setDescription(
        "date deadline (1,2,3, etc. the max is depends on the month)",
      )
      .setRequired(true),
  );

export async function execute(interaction) {
  const gameId = interaction.options.getString("game-id");
  const data = await fetchUserId(gameId);
  if (!data) {
    return await interaction.reply({
      content: "Ingame Id could not be found",
      flags: MessageFlags.Ephemeral,
    });
  }

  const discordId = interaction.user.id;
  const target = interaction.options.getString("target").replaceAll(".", "");
  const deadline = interaction.options.getString("deadline");

  const thisMonthDateMax = new Date(
    new Date().getFullYear,
    new Date().getMonth,
    0,
  ).getDate();

  if (deadline > thisMonthDateMax) {
    return await interaction.reply({
      content: "Deadline is exceeding this month date",
      flags: MessageFlags.Ephemeral,
    });
  }

  const prepared = db.prepare(
    "INSERT OR REPLACE INTO user_target VALUES(?,?,?,?)",
  );
  prepared.run(discordId, gameId, target, deadline);

  const embed = new EmbedBuilder()
    .setColor("Aqua")
    .setTitle("Target Set✍️")
    .setDescription(
      `Target has been set to account: **${data.name}**\nWith fans target: **${shortenNumber(
        target,
        3,
      )}**\nDeadline: **${new Date().toLocaleString("en-ID", { month: "long" })} ${deadline}**\n`,
    )
    .setThumbnail(
      "https://i.pinimg.com/736x/c2/bc/1a/c2bc1af67676802367e5a2a8f4ffe9fc.jpg",
    )
    .setFooter({
      text: "Data Taken From Uma.moe",
      iconURL:
        "https://pbs.twimg.com/profile_images/2007893454622171136/Vq2cg9RX_400x400.jpg",
    });

  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
