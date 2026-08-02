import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { EmbedBuilder } from "discord.js";
import umaFetchCircleInfo from "../../service/umaMoe/umaFetchCircleInfo.js";
import { shortenNumber } from "../../service/umaMoe/table.js";

export const data = new SlashCommandBuilder()
  .setName("circle-search")
  .setDescription("Search circles using the name and leader name(optional)")
  .addStringOption((option) =>
    option
      .setName("circle-name")
      .setDescription("Circle name to search")
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("leader-id")
      .setDescription("leader id of the circle")
      .setRequired(false),
  )
  .addStringOption((option) =>
    option
      .setName("is-public")
      .setDescription(
        "by default message will only able to seen by you. if you want it to be public type 1",
      )
      .setRequired(false),
  );

// storing message data for pagination purpose
export let pagination = new Map();

export async function execute(interaction) {
  const circleName =
    interaction.options.getString("circle-name").replace(" ", "%20") || "";
  const leaderId = interaction.options.getString("leader-id") || "";
  const isPublic = interaction.options.getString("is-public") || 0;

  /**
   * message will be stored into a Map object with
   * discord message id as the key and paginationObj as the value
   * paginationObj.data is an array that stored the circle list data
   * it is a 2d array with each x array containing 5 cicle data
   */

  const data = await umaFetchCircleInfo(circleName, leaderId);
  const embedArray = [];
  const paginationObj = {
    page: 0,
    expire: 0, // the expire is one hour
    data: [],
  };

  for (const item in data) {
    const clubData = `\n[#${parseInt(item) + 1}] ${data[item].name} | Id: ${data[item].circleId} \n    Leader: ${data[item].leaderName} | Mbr: ${data[item].memberCount}\n    Rank: #${data[item].rank} | ${shortenNumber(data[item].circleFans)}\n`;
    embedArray.push(clubData);

    if (embedArray.length == 5) {
      paginationObj.data.push("```" + "yaml" + embedArray.join("") + "```");
      paginationObj.expire = Date.now() + 3600000;
      embedArray.splice(0, 5);
    }
    if (item == data.length - 1) {
      paginationObj.data.push("```" + "yaml" + embedArray.join("") + "```");
      paginationObj.expire = Date.now() + 3600000;
      embedArray.splice(0, 5);
    }
  }

  const embed = new EmbedBuilder()
    .setColor("Orange")
    .setTitle("Circle List")
    .setDescription(paginationObj.data[0])
    .setFooter({
      text: "Data Taken From Uma.moe",
      iconURL:
        "https://pbs.twimg.com/profile_images/2007893454622171136/Vq2cg9RX_400x400.jpg",
    });

  // button  for navigation
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("next")
      .setLabel("Next")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("prev")
      .setLabel("prev")
      .setStyle(ButtonStyle.Secondary),
  );

  let message = undefined;

  if (isPublic == 1) {
    message = await interaction.reply({
      embeds: [embed],
      components: [row],
      withResponse: true,
    });
  } else {
    message = await interaction.reply({
      embeds: [embed],
      components: [row],
      withResponse: true,
      flags: MessageFlags.Ephemeral,
    });
  }

  //   console.log(paginationObj);
  const savedData = structuredClone(paginationObj);
  pagination.set(message.interaction.id, savedData); // save it to Map object

  paginationObj.data.splice(0, paginationObj.data.length);
}
