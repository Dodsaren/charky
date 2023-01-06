# charky

A discord bot written in node with the discordjs api.

To run locally you must have node and npm on your system.

The best ways to handle node and npm installations is with nvm.
This will let you have different versions of node and npm on your system and easily switch between them.

MacOS/Linux: https://github.com/nvm-sh/nvm

Windows: https://github.com/coreybutler/nvm-windows

To test your code before publishing a PR I recommend that you
create a separate app and bot at https://discordapp.com/developers/applications

Copy your bots secret token and paste it into an environment file, see below
Create a file in the root of the project with the name `.env` and add environment variables like your bot token.
Like so:

```
BOT_SECRET_TOKEN=[my_secret_token_from_discord]
```

install dependencies `npm i`

run the development server `npm run dev`

create a discord server and invite your bot to it with: https://discordapp.com/oauth2/authorize?client_id=[my_discord_app_client_id]&scope=bot

Go ham.

Invite link to the OG bot: https://discordapp.com/oauth2/authorize?client_id=683623472915546132&scope=bot

## good ideas

- integration with youtube
- ...
