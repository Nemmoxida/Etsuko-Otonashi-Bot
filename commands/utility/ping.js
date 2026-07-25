import {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Replies with Pong!");

export async function execute(interaction) {
  const confirm = new ButtonBuilder()
    .setCustomId("confirm")
    .setLabel("Confirm Ban")
    .setStyle(ButtonStyle.Danger);
  const row = new ActionRowBuilder().addComponents(confirm);
  await interaction.reply({
    content: "Ponggggggggggggggggggggggggg!",
    components: [row],
  });
}
