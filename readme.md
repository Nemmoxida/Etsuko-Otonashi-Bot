# Etsuko Otonashi Bot

[![npm version](https://badge.fury.io/js/discord.js.svg)](https://badge.fury.io/js/discord.js)

Built using discord library for JS, discord.js. Currenly only provide info for member fans count and progress report for club.

# Features

- Members fans monitoring and progression
- Club daily fans progress overview
- User fans target (WIP)

# Commands

- /ping - quick test to check connection
- /add-cirlce - add a circle id to the corresponding channel
- /fetch-club - fetch club info and members progression

# Demo

Players who manage to get to above daily quota

![above average](https://i.ibb.co.com/39cGYR94/Discord-luu-Uw-Xs-YZH.png)

Player who manage to get to below daily quota

![below average](https://i.ibb.co.com/snsq7XF/Discord-4z-KT3-Fc-RGv.png)

Club daily overview

![daily overview](https://i.ibb.co.com/0ySpSCpY/Discord-hdl-ZNv99ut.png)

# Dependencies

- discord.js
- ascii-table
- better-sqlite3
- dotenv

# Installation and Usage

```shell
git clone

cd *

# install all dependency
npm install

npm run start
# or if you have or using nodemon
npm run nodemon-start
```

# Enviroment Variables

Create a .env file using the .example.env format

```env
DISCORD_TOKEN =
UMA_TOKEN =
CLIENT_ID =
```

# Feature to be added

- User fans target (WIP)
- Circle Id search
- Fetch club data manual without registering club channel
- Adding docker
