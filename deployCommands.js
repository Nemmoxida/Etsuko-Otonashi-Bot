import { REST, Routes } from "discord.js";
import { configDotenv } from "dotenv";
import fs from "fs";
import path from "path";

configDotenv();

const __dirname = import.meta.dirname;
const commands = [];

const folderPath = path.join(__dirname, "commands");
const commandFolder = fs.readdirSync(folderPath);

for (const folder in commandFolder) {
  const commandPath = path.join(folderPath, commandFolder[folder]);

  const commandFiles = fs
    .readdirSync(commandPath)
    .filter((file) => file.endsWith(".js"));

  for (const file in commandFiles) {
    const filePath = path.join(commandPath, commandFiles[file]);

    const command = await import(`file://${filePath}`);

    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(`command format for file at ${filePath} is not valid`);
    }
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN);
// and deploy your commands!
(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`,
    );
    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      {
        body: commands,
      },
    );
    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`,
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();
