import { configDotenv } from "dotenv";
import {
  Client,
  GatewayIntentBits,
  Events,
  MessageFlags,
  Collection,
} from "discord.js";
import fs from "fs";
import path from "path";

// load env
configDotenv();

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
