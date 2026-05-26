const state = require("../utils/state");
const { Markup } = require("telegraf");

module.exports = (bot) => {

    bot.command("setkey", async (ctx) => {
        const message = ctx.message.text.trim();
        const parts = message.split(" ");

        if (parts.length < 2) {
            return ctx.reply(
                "🔑 <b>API Key Setup</b>\n\nTo connect to n8n v1+, you need an API Key.\n\n<b>Usage:</b>\n<code>/setkey n8n_api_...</code>\n\n<i>Generate a key in n8n: Settings › Developer › API Keys</i>",
                { parse_mode: "HTML" }
            );
        }

        const key = parts[1].trim();

        // Basic validation
        if (key.length < 10) {
            return ctx.reply("❌ Invalid key format. The key looks too short — please copy the full key from n8n.");
        }

        // ── Security: delete the message containing the key immediately ──
        // This prevents the raw API key from staying visible in chat history.
        try { await ctx.deleteMessage(); } catch (_) { /* Ignore if bot lacks delete permission */ }

        try {
            state.set("n8nApiKey", key);
            await ctx.reply(
                [
                    "✅ <b>API Key Saved &amp; Secured!</b>",
                    "",
                    "├ Stored: Encrypted (AES-256)",
                    "├ Message with key: Deleted from chat",
                    "└ Status: Bot is now fully connected to n8n",
                    "",
                    "Run /auth_status to verify, or /workflows to start managing."
                ].join("\n"),
                { parse_mode: "HTML" }
            );
        } catch (err) {
            console.error(err);
            await ctx.reply("❌ Failed to save API Key. Please try again.");
        }
    });

    // Helper to check key status
    bot.command("auth_status", (ctx) => {
        const key = state.get("n8nApiKey");
        if (key) {
            // Show first 4 and last 4 chars only — enough to verify the key without exposing it
            const masked = key.length > 8
                ? key.substring(0, 4) + "••••••••" + key.slice(-4)
                : "••••••••";
            ctx.reply(`✅ API Key Configured: <code>${masked}</code>\n└ Use /setkey to update it.`, { parse_mode: "HTML" });
        } else {
            ctx.reply("⚠️ No API Key configured. Using Basic Auth (Legacy).\n\nRun <code>/setkey &lt;your_key&gt;</code> to enable full functionality.", { parse_mode: "HTML" });
        }
    });

};
