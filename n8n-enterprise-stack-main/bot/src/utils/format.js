
/**
 * Telegram message formatting helpers.
 * Uses HTML parse mode for rich formatting.
 */

function escapeHtml(text) {
    if (!text) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function statusEmoji(active) {
    return active ? "🟢" : "🔴";
}

function executionStatusEmoji(status) {
    const map = {
        success: "✅",
        error: "❌",
        running: "⏳",
        waiting: "⏸",
        unknown: "❓"
    };
    return map[status] || map.unknown;
}

function formatDuration(ms) {
    if (!ms || ms < 0) return "N/A";
    if (ms < 1000) return `${ms}ms`;
    const seconds = (ms / 1000).toFixed(1);
    if (seconds < 60) return `${seconds}s`;
    const minutes = (ms / 60000).toFixed(1);
    return `${minutes}m`;
}

function truncate(text, maxLen = 100) {
    if (!text) return "";
    text = String(text);
    return text.length > maxLen ? text.substring(0, maxLen - 3) + "..." : text;
}

function formatWorkflowCard(wf) {
    const status = statusEmoji(wf.active);
    const name = escapeHtml(wf.name);
    const id = escapeHtml(wf.id);
    const updated = wf.updatedAt ? new Date(wf.updatedAt).toLocaleString() : "N/A";

    return [
        `${status} <b>${name}</b>`,
        `├ ID: <code>${id}</code>`,
        `├ Active: ${wf.active ? "Yes" : "No"}`,
        `├ Nodes: ${wf.nodes?.length || 0}`,
        `└ Updated: ${updated}`
    ].join("\n");
}

function formatExecutionCard(exec) {
    const emoji = executionStatusEmoji(exec.status || (exec.finished ? "success" : "error"));
    const wfName = escapeHtml(exec.workflowData?.name || exec.workflowId || "Unknown");
    const startedAt = exec.startedAt ? new Date(exec.startedAt).toLocaleString() : "N/A";
    const duration = exec.stoppedAt && exec.startedAt
        ? formatDuration(new Date(exec.stoppedAt) - new Date(exec.startedAt))
        : "N/A";

    return [
        `${emoji} <b>${wfName}</b>`,
        `├ ID: <code>${exec.id}</code>`,
        `├ Status: ${exec.status || (exec.finished ? "success" : "error")}`,
        `├ Started: ${startedAt}`,
        `└ Duration: ${duration}`
    ].join("\n");
}

function formatStatsTable(stats) {
    const lines = [
        `📊 <b>Execution Statistics</b>`,
        ``,
        `├ Total: <b>${stats.total}</b>`,
        `├ ✅ Success: <b>${stats.success}</b> (${stats.successRate}%)`,
        `├ ❌ Failed: <b>${stats.failed}</b> (${stats.failRate}%)`,
        `├ ⏱ Avg Duration: <b>${formatDuration(stats.avgDuration)}</b>`,
        `└ 📅 Period: Last ${stats.period || "all time"}`
    ];
    return lines.join("\n");
}

function formatAlertMessage(payload) {
    const wfName = escapeHtml(payload.workflow?.name || "Unknown");
    const wfId = escapeHtml(payload.workflow?.id || "N/A");
    const error = escapeHtml(truncate(payload.error?.message || payload.message || "Unknown error", 200));
    const time = new Date().toLocaleString();

    return [
        `🚨 <b>WORKFLOW FAILURE ALERT</b>`,
        ``,
        `├ Workflow: <b>${wfName}</b>`,
        `├ ID: <code>${wfId}</code>`,
        `├ Time: ${time}`,
        `└ Error: <i>${error}</i>`
    ].join("\n");
}


// ─── Shared Helpers ───────────────────────────────────

/**
 * Format a millisecond duration into a human-readable uptime string.
 * e.g. 90061000 → "1d 1h 1m"
 */
function formatUptime(ms) {
    if (!ms || ms < 0) return "N/A";
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ${h % 24}h ${m % 60}m`;
    if (h > 0) return `${h}h ${m % 60}m`;
    return `${m}m ${s % 60}s`;
}

/**
 * Render a 10-segment ASCII progress bar for a percentage value (0–100).
 * e.g. progressBar(70) → "███████░░░"
 */
function progressBar(percent) {
    const filled = Math.round(Math.min(Math.max(percent, 0), 100) / 10);
    const empty = 10 - filled;
    return "█".repeat(filled) + "░".repeat(empty);
}

module.exports = {
    escapeHtml,
    statusEmoji,
    executionStatusEmoji,
    formatDuration,
    truncate,
    formatWorkflowCard,
    formatExecutionCard,
    formatStatsTable,
    formatAlertMessage,
    formatUptime,
    progressBar,
};
