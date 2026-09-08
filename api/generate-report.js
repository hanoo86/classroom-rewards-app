// api/generate-report.js
// Vercel serverless function. Keeps your Anthropic API key on the server —
// it is never sent to the browser. The app's frontend calls this route at
// /api/generate-report instead of calling api.anthropic.com directly
// (which never works from a browser: no CORS access, and it would mean
// shipping your API key in public JavaScript).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { studentName, positiveAttitudes = [], areasForImprovement = [], xp = 0 } = req.body || {};
  if (!studentName) {
    res.status(400).json({ error: 'studentName is required' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server is missing the ANTHROPIC_API_KEY environment variable.' });
    return;
  }

  const prompt = `Write a short, positive and professional student progress note (2-3 sentences) for a student named ${studentName}.
Positive attitudes shown: ${positiveAttitudes.length ? positiveAttitudes.join(', ') : 'none selected'}.
Areas for improvement: ${areasForImprovement.length ? areasForImprovement.join(', ') : 'none selected'}.
Total XP earned: ${xp}.
Keep it encouraging, specific, and suitable for a parent-teacher report. Do not use bullet points.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      res.status(response.status).json({ error: data?.error?.message || 'Anthropic API error' });
      return;
    }

    const text = data.content?.[0]?.text || '';
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Unknown error calling Anthropic API' });
  }
}
