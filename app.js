import { configDotenv } from "dotenv";
import {
  Client,
  GatewayIntentBits,
  Events,
  MessageFlags,
  Collection,
  EmbedBuilder,
} from "discord.js";
import fs from "fs";
import path from "path";
import { pagination } from "./commands/uma/circleSearch.js";
import db from "./db/db.js";

// load env
// configDotenv();

// take dir es6 stile
const __dirname = import.meta.dirname;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Bot logged as: ${readyClient.user.tag} and ready to use`);
});

client.commands = new Collection();

const folderPath = path.join(__dirname, "commands");
const commandFolder = fs.readdirSync(folderPath);

// load commands for the bot
for (const folder in commandFolder) {
  const commandPath = path.join(folderPath, commandFolder[folder]);

  const commandFiles = fs
    .readdirSync(commandPath)
    .filter((file) => file.endsWith(".js"));

  for (const file in commandFiles) {
    const filePath = path.join(commandPath, commandFiles[file]);

    const command = await import(`file://${filePath}`);

    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`command format for file at ${filePath} is not valid`);
    }
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
  // check if it's 2nd date of the month
  if (new Date().getDate() == 2) {
    db.prepare("DELETE FROM user_target").run();
    db.exec(
      "CREATE TABLE IF NOT EXISTS user_target(discord_id TEXT PRIMARY KEY, game_id TEXT NOT NULL, target INT NOT NULL)",
    );
  }

  // circleSearch button event handler
  if (interaction.isButton()) {
    const messageId =
      interaction.message.interactionMetadata?.id ?? interaction.message.id;
    const messageData = pagination.get(messageId);

    if (messageData.expire < Date.now()) {
      const embedExpire = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Expired")
        .setDescription("This message is expired")
        .setFooter({
          text: "Data Taken From Uma.moe",
          iconURL:
            "https://pbs.twimg.com/profile_images/2007893454622171136/Vq2cg9RX_400x400.jpg",
        });

      return interaction.update({ embeds: [embedExpire] });
    }

    let page = 0;

    if (interaction.customId == "next") {
      page = Math.min(messageData.page + 1, messageData.data.length);
    }
    if (interaction.customId == "prev") {
      page = Math.max(messageData.page - 1, 0);
    }

    messageData.page = page;
    pagination.set(messageId, messageData);

    const embed = new EmbedBuilder()
      .setColor("Orange")
      .setTitle("Circle List")
      .setDescription(messageData.data[messageData.page])
      .setFooter({
        text: "Data Taken From Uma.moe",
        iconURL:
          "https://pbs.twimg.com/profile_images/2007893454622171136/Vq2cg9RX_400x400.jpg",
      });

    interaction.update({ embeds: [embed] });
  }

  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
