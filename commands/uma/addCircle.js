import { MessageFlags, SlashCommandBuilder } from "discord.js";
import db from "../../db/db.js";

export const data = new SlashCommandBuilder()
  .setName("add-circle")
  .setDescription("add circle based on channels or forums")
  .addStringOption((option) =>
    option
      .setName("circle-id")
      .setDescription("Circle Id for registering this channel")
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("quota")
      .setDescription(
        "quota per DAY e.g. 1000000 or 1.000.000 (use dot as a separator)",
      )
      .setRequired(true),
  );

// unused hashtable, may be used for performence. but generally better-sqlite3 is sufficient enough
// export let circleListMap = new Map();

export async function execute(interaction) {
  // ADDD CHECK FOR A VALID CIRCLE ID
  const circleTarget = interaction.options.getString("circle-id");
  const channelId = interaction.channelId;
  const quota = interaction.options.getString("quota");

  // check if quota is a number
  if (Number(quota) === NaN) {
    return await interaction.reply({
      content: "quota must be a number",
      flags: MessageFlags.Ephemeral,
    });
  }

  const dbInsert = db
    .prepare("INSERT OR REPLACE INTO circle_list VALUES(?,?,?)")
    .run(channelId, circleTarget, quota.replaceAll(".", ""));

  await interaction.reply({
    content: `This channel has been set to circle ${circleTarget} with quota ${quota.toLocaleString("ID")} per day`,
    flags: MessageFlags.Ephemeral,
  });
}
