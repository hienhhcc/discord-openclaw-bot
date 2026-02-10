import axios from "axios";
import { Client, GatewayIntentBits } from "discord.js";
import "dotenv/config";

// ============================================================================
// Configuration & Validation
// ============================================================================

const config = {
  discordToken: process.env.DISCORD_TOKEN,
  openclawApiKey: process.env.OPENCLAW_API_KEY,
  openclawApiUrl:
    process.env.OPENCLAW_API_URL || "http://localhost:8080/v1/chat/completions",
  openclawModel: process.env.OPENCLAW_MODEL || "default",
  botPrefix: process.env.BOT_PREFIX || "!",
};

// Validate required environment variables
function validateConfig() {
  const required = ["discordToken", "openclawApiKey"];
  const missing = required.filter((key) => !config[key]);

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((key) => {
      const envVar = key.replace(/([A-Z])/g, "_$1").toUpperCase();
      console.error(`   - ${envVar}`);
    });
    console.error(
      "\n💡 Copy .env.example to .env and fill in your credentials",
    );
    process.exit(1);
  }
}

validateConfig();

// ============================================================================
// Discord Client Setup
// ============================================================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ============================================================================
// OpenClaw API Integration
// ============================================================================

/**
 * Sends a message to OpenClaw API and returns the response
 * @param {string} userMessage - The user's input message
 * @returns {Promise<string>} The AI response
 */
async function queryOpenClaw(userMessage) {
  try {
    const response = await axios.post(
      config.openclawApiUrl,
      {
        model: config.openclawModel,
        messages: [
          {
            role: "user",
            content: userMessage,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.openclawApiKey}`,
        },
        timeout: 600000, // 30 second timeout
      },
    );

    // Extract the response content
    if (response.data?.choices?.[0]?.message?.content) {
      return response.data.choices[0].message.content;
    } else {
      console.error("Unexpected API response structure:", response.data);
      return "Sorry, I received an unexpected response format from the AI service.";
    }
  } catch (error) {
    console.error("OpenClaw API Error:", error.message);

    if (error.response) {
      // The request was made and the server responded with an error status
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      return `Sorry, the AI service returned an error: ${error.response.status} ${error.response.statusText}`;
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received from OpenClaw API");
      return "Sorry, I could not reach the AI service. Please check if OpenClaw is running.";
    } else {
      // Something happened in setting up the request
      return "Sorry, there was an error processing your request.";
    }
  }
}

// ============================================================================
// Discord Event Handlers
// ============================================================================

client.once("ready", () => {
  console.log("✅ Bot is online!");
  console.log(`📝 Logged in as: ${client.user.tag}`);
  console.log(`🤖 Bot ID: ${client.user.id}`);
  console.log(`📡 Connected to ${client.guilds.cache.size} server(s)`);
  console.log(`\n💬 Listening in #openclaw channel (no prefix required)`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});

client.on("messageCreate", async (message) => {
  // Ignore messages from bots (including itself)
  if (message.author.bot) return;

  // Only respond in the #openclaw channel
  // if (message.channel.name !== "open_claw") return;

  // Use the full message content as the prompt
  const userPrompt = message.content.trim();

  // Validate input
  if (!userPrompt) {
    await message.reply("❓ Please send a message to chat with me!");
    return;
  }

  if (userPrompt.length > 2000) {
    await message.reply(
      "⚠️ Your message is too long. Please keep it under 2000 characters.",
    );
    return;
  }

  // Show typing indicator while processing
  await message.channel.sendTyping();

  try {
    console.log(`\n📨 New query from ${message.author.tag}:`);
    console.log(`   "${userPrompt}"`);

    // Query OpenClaw API
    const aiResponse = await queryOpenClaw(userPrompt);

    console.log(`✅ Response sent (${aiResponse.length} chars)`);

    // Discord has a 2000 character limit per message
    if (aiResponse.length > 2000) {
      // Split response into multiple messages if needed
      const chunks = aiResponse.match(/[\s\S]{1,2000}/g) || [];
      for (const chunk of chunks) {
        await message.reply(chunk);
      }
    } else {
      await message.reply(aiResponse);
    }
  } catch (error) {
    console.error("Error handling message:", error);
    await message.reply(
      "❌ Sorry, something went wrong while processing your request.",
    );
  }
});

// ============================================================================
// Error Handling
// ============================================================================

client.on("error", (error) => {
  console.error("Discord client error:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

process.on("SIGINT", () => {
  console.log("\n\n👋 Shutting down bot...");
  client.destroy();
  process.exit(0);
});

// ============================================================================
// Start Bot
// ============================================================================

console.log("🚀 Starting Discord-OpenClaw Bot...");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

client.login(config.discordToken).catch((error) => {
  console.error("❌ Failed to login to Discord:");
  console.error(error.message);
  process.exit(1);
});
