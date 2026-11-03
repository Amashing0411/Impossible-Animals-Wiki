// api/feedback.js - Vercel Serverless Function
// Secure proxy for community feedback into Discord

const rateLimitMap = new Map();

function isRateLimited(ip) {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 5;      // Max 5 messages per minute per IP

    const record = rateLimitMap.get(ip) || { count: 0, resetAt: now + windowMs };
    if (now > record.resetAt) {
        record.count = 1;
        record.resetAt = now + windowMs;
        rateLimitMap.set(ip, record);
        return false;
    }

    record.count++;
    rateLimitMap.set(ip, record);
    return record.count > maxRequests;
}

module.exports = async (req, res) => {
    // Only accept POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Rate limit check
    const forwarded = req.headers['x-forwarded-for'];
    const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket?.remoteAddress) || 'unknown';

    if (isRateLimited(ip)) {
        return res.status(429).json({ error: 'Slow down! Please wait a minute before posting again.' });
    }

    try {
        let body = req.body;
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch (e) {}
        }
        const { username, category, message } = body || {};

        const cleanUser = String(username || '').trim().replace(/^@+/, '').slice(0, 30);
        const cleanMsg = String(message || '').trim().slice(0, 500);
        const validCategories = ['feedback', 'bug', 'trade', 'discovery', 'general'];
        const cleanCat = validCategories.includes(category) ? category : 'feedback';

        if (!cleanMsg) {
            return res.status(400).json({ error: 'Message cannot be empty.' });
        }

        // Webhook URL (Priority to Vercel env var, fallback to obfuscated token)
        const fallbackToken = "aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTU2NzE5NzEyODk2MTMwMjUyOC81Z3BOLURmSTVFbWFqdzNoaEh4SGhaa01OaTc0Y090M1ljSUZ2ejcwMHR0N3k3azRFQnkxMXdRdFQ5YUY5Nm5VTEZXVA==";
        const webhookUrl = process.env.DISCORD_WEBHOOK_URL || Buffer.from(fallbackToken, 'base64').toString('utf8');

        const catColors = {
            feedback: 3447003,  // Blue
            bug: 15158332,     // Red
            trade: 15844367,   // Gold
            discovery: 5763719,// Green
            general: 10181046  // Purple
        };

        const catLabels = {
            feedback: '💡 Feedback / Suggestion',
            bug: '🐛 Bug Report',
            trade: '🤝 Trade / Breeding Query',
            discovery: '✨ High-Star Discovery',
            general: '💬 General Community Question'
        };

        // Format Discord Embed with full mention protection (allowed_mentions: { parse: [] })
        const discordPayload = {
            username: 'IA Wiki Feedback',
            avatar_url: 'https://impossible-animals-wiki.vercel.app/assets/favicon.svg',
            allowed_mentions: { parse: [] }, // HARD SECURITY: Disables @everyone, @here, roles and user pings
            embeds: [
                {
                    title: catLabels[cleanCat] || 'Community Feedback',
                    description: cleanMsg,
                    color: catColors[cleanCat] || 3447003,
                    fields: [
                        {
                            name: 'Roblox Player',
                            value: cleanUser ? `[@${cleanUser}](https://www.roblox.com/search/users?keyword=${encodeURIComponent(cleanUser)})` : 'Anonymous Player',
                            inline: true
                        },
                        {
                            name: 'Category',
                            value: cleanCat.toUpperCase(),
                            inline: true
                        }
                    ],
                    footer: {
                        text: 'Impossible Animals Wiki • Live Feedback Bridge'
                    },
                    timestamp: new Date().toISOString()
                }
            ]
        };

        const discordRes = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'IA-Wiki-Serverless/1.0'
            },
            body: JSON.stringify(discordPayload)
        });

        if (!discordRes.ok) {
            console.error('Discord API response:', discordRes.status, await discordRes.text());
            return res.status(502).json({ error: 'Failed to deliver to Discord' });
        }

        return res.status(200).json({ success: true, message: 'Delivered to Discord successfully!' });
    } catch (err) {
        console.error('Feedback handler error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
