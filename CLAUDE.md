# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Discord bot that integrates with OpenClaw (AI/LLM service). Users can interact with OpenClaw by sending messages in Discord with the `!ask` command. The bot uses **ES Modules** (`import`/`export` syntax) as specified by `"type": "module"` in package.json.

## Project Status

✅ **Fully Implemented and Ready to Use**

The bot includes:
- Discord.js client with proper intents for message reading
- Message-based command system (`!ask <prompt>`)
- OpenClaw API integration via axios
- Environment variable configuration
- Comprehensive error handling
- Input validation and sanitization
- Automatic message splitting for long responses

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy the example environment file and fill in your credentials:
```bash
cp .env.example .env
```

Edit `.env` with your actual values:
```env
DISCORD_TOKEN=your_discord_bot_token_here
OPENCLAW_API_KEY=your_openclaw_api_key_here
OPENCLAW_API_URL=http://localhost:8080/v1/chat/completions
OPENCLAW_MODEL=default-model-name
```

### 3. Run the Bot

**Production:**
```bash
npm start
```

**Development (with auto-reload):**
```bash
npm run dev
```

## Usage

In any Discord channel where the bot has access:

```
!ask What is the capital of France?
!ask Explain quantum computing in simple terms
!ask Write a haiku about programming
```

The bot will:
1. Receive your message
2. Send it to OpenClaw API
3. Return the AI-generated response

## Architecture

### File Structure

```
discord-openclaw-bot/
├── index.js           # Main bot entry point (ES Modules)
├── package.json       # Dependencies and scripts
├── .env              # Environment variables (NOT in git)
├── .env.example      # Environment template (in git)
├── .gitignore        # Excludes sensitive files
├── CLAUDE.md         # This file
└── node_modules/     # Dependencies (NOT in git)
```

### index.js Structure

1. **Configuration & Validation** - Loads and validates environment variables
2. **Discord Client Setup** - Initializes Discord.js client with required intents
3. **OpenClaw API Integration** - `queryOpenClaw()` function handles API calls
4. **Event Handlers** - `ready` and `messageCreate` events
5. **Error Handling** - Graceful error handling for network and API failures
6. **Bot Login** - Connects to Discord

### Key Features

- **ES Module Syntax**: Uses `import`/`export` instead of CommonJS `require()`
- **Environment Validation**: Checks for required variables on startup
- **Typing Indicator**: Shows "Bot is typing..." while processing
- **Long Message Handling**: Automatically splits responses over 2000 characters
- **Error Messages**: User-friendly error messages for common issues
- **Logging**: Console logs for monitoring bot activity

## Dependencies

### Production Dependencies
- `discord.js` (v14.25.1) - Discord API wrapper
- `dotenv` (v17.2.4) - Environment variable loader
- `axios` (v1.13.5) - HTTP client for OpenClaw API

### Development Dependencies
- `nodemon` (v3.1.11) - Auto-reload during development

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DISCORD_TOKEN` | ✅ Yes | - | Discord bot token from Developer Portal |
| `OPENCLAW_API_KEY` | ✅ Yes | - | OpenClaw API authentication key |
| `OPENCLAW_API_URL` | ❌ No | `http://localhost:8080/v1/chat/completions` | OpenClaw API endpoint |
| `OPENCLAW_MODEL` | ❌ No | `default` | Model name to use |
| `BOT_PREFIX` | ❌ No | `!` | Command prefix |

## Getting Discord Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the bot token to `DISCORD_TOKEN` in `.env`
5. Enable these intents:
   - ✅ Message Content Intent
   - ✅ Guild Messages
6. Invite bot to your server with permissions:
   - Read Messages/View Channels
   - Send Messages
   - Send Messages in Threads

## Discord Intents

The bot requires these intents (configured in index.js):
- `Guilds` - Access to server information
- `GuildMessages` - Receive message events
- `MessageContent` - Read message content (privileged intent)

**Important**: Enable "Message Content Intent" in Discord Developer Portal under Bot → Privileged Gateway Intents.

## Command System

Currently uses **prefix commands** (`!ask`). The bot:
1. Listens for messages starting with `!ask`
2. Extracts the user's prompt
3. Validates input (not empty, under 2000 chars)
4. Sends to OpenClaw API
5. Returns response to Discord

## Error Handling

The bot handles:
- ✅ Missing environment variables (exits with error message)
- ✅ Discord connection failures
- ✅ OpenClaw API errors (network, auth, server errors)
- ✅ Invalid user input (empty prompt, too long)
- ✅ Long responses (auto-splits into multiple messages)
- ✅ Unexpected API response formats

## Security Features

- ✅ `.gitignore` prevents committing sensitive files (`.env`, `node_modules`)
- ✅ Environment variables for all secrets
- ✅ Input validation on user prompts
- ✅ Bot ignores messages from other bots (prevents loops)

## Future Enhancements (Not Yet Implemented)

Consider adding:
- **Slash Commands**: Modern Discord `/ask` commands instead of `!ask`
- **Conversation History**: Multi-turn conversations with context
- **Rate Limiting**: Prevent API abuse
- **Database**: Store user preferences and conversation history
- **Multiple Models**: Let users choose different AI models
- **Admin Commands**: Bot management commands
- **Deployment**: Docker, PM2, or cloud hosting setup

## Troubleshooting

### Bot doesn't respond
- ✅ Check `.env` has correct `DISCORD_TOKEN`
- ✅ Verify "Message Content Intent" is enabled in Developer Portal
- ✅ Ensure bot has permissions in the Discord channel

### "Could not reach AI service"
- ✅ Check OpenClaw is running at `OPENCLAW_API_URL`
- ✅ Verify `OPENCLAW_API_KEY` is correct
- ✅ Check network connectivity to OpenClaw server

### "Missing required environment variables"
- ✅ Ensure `.env` file exists in project root
- ✅ Copy from `.env.example` if needed
- ✅ Fill in all required values

## Module System

This project uses **ES Modules**:
- ✅ `package.json` has `"type": "module"`
- ✅ Use `import`/`export` syntax (not `require()`)
- ✅ File extensions required in imports from local files

Example:
```javascript
// ✅ Correct (ES Modules)
import { Client } from 'discord.js';
import axios from 'axios';

// ❌ Wrong (CommonJS)
const { Client } = require('discord.js');
const axios = require('axios');
```

## Contributing

When modifying this bot:
1. Use ES Module syntax for all imports
2. Add environment variables to `.env.example` (not `.env`)
3. Update this CLAUDE.md file with any architectural changes
4. Test with `npm run dev` before committing
5. Ensure `.gitignore` prevents committing secrets

## Support

For issues or questions:
- Check console logs for error messages
- Verify environment variables are set correctly
- Ensure Discord intents are enabled
- Test OpenClaw API connection independently
