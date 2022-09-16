# discordmusicbot
This is a Discord music bot written in Discord.js v13.

## Features:
- playing songs by name or yt link
- playing playlists
- loop
- pause/unpause
- info about currently playing song
- queue with a shuffling option
- skipping & voteskipping
- setting volume
- multi-server support

## New:
- v0.2:
    - playing playlists (beta)
    - disconnecting from channel
- v0.3:
    - /np fixes
    - song lyrics command
- v0.4:
    - playing playlists is out of beta
    - queue now has pages
    - minor bug fixes
- v0.5:
    - commands now require certain permissions
    - shuffling queue
    - skipping multiple songs with /skip and /skip-range
    - /voteskip to skip song with voting
    - minor bug fixes

## How to use?
- Install all the required packages mentioned in package.json
- Get bot token from [here](https://discord.com/developers/applications)
- Create config.json file and make it look like this
  ```
	{ 
		"token": "YOUR_BOT_TOKEN"
	}
  ```
- start command prompt from the folder index.js is located in
- run ``` node index.js ``` in your command prompt to start bot.

In case of any problems open issue or write me directly on m.kostyk22@gmail.com
