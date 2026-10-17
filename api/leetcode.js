import { LEETCODE_GRAPHQL_API_URL, LEETCODE_USERNAME } from '../src/config/site.js';

const QUERY = `query leetcodeActivity($username: String!) {
  matchedUser(username: $username) {
    submitStatsGlobal { acSubmissionNum { difficulty count } }
    userCalendar { streak totalActiveDays submissionCalendar }
  }
}`;

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed.' });
  }
  try {
    const upstream = await fetch(LEETCODE_GRAPHQL_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Referer: `https://leetcode.com/u/${LEETCODE_USERNAME}/` },
      body: JSON.stringify({ query: QUERY, variables: { username: LEETCODE_USERNAME } }),
    });
    if (!upstream.ok) return response.status(502).json({ error: `LeetCode returned HTTP ${upstream.status}.` });
    const payload = await upstream.json();
    const user = payload?.data?.matchedUser;
    const solved = user?.submitStatsGlobal?.acSubmissionNum;
    const calendar = user?.userCalendar;
    if (payload.errors?.length || !user || !Array.isArray(solved) || !calendar?.submissionCalendar) {
      return response.status(502).json({ error: 'LeetCode returned incomplete profile data.' });
    }
    const byDifficulty = Object.fromEntries(solved.map(({ difficulty, count }) => [difficulty, Number(count)]));
    const parsedCalendar = typeof calendar.submissionCalendar === 'string' ? JSON.parse(calendar.submissionCalendar) : calendar.submissionCalendar;
    const entries = Object.entries(parsedCalendar).map(([timestamp, count]) => ({ date: new Date(Number(timestamp) * 1000).toISOString().slice(0, 10), count: Number(count) }));
    response.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=3600');
    return response.status(200).json({
      totalSolved: byDifficulty.All,
      easy: byDifficulty.Easy,
      medium: byDifficulty.Medium,
      hard: byDifficulty.Hard,
      activeDays: Number(calendar.totalActiveDays),
      currentStreak: Number(calendar.streak),
      calendar: entries,
    });
  } catch (error) {
    return response.status(502).json({ error: 'Unable to retrieve LeetCode activity.', detail: error.message });
  }
}
