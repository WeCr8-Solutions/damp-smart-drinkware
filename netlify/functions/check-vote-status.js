/**
 * Netlify Function: Check Vote Status
 * Checks if a user/device has already voted
 */

// Shared voting data (in production, this would be in a database)
const votes = new Map();

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { fingerprint, userId, voteType } = JSON.parse(event.body);
    const voterId = voteType === 'authenticated' ? userId : fingerprint;

    if (!voterId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing voter identifier' })
      };
    }

    const existingVote = votes.get(voterId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        hasVoted: !!existingVote,
        vote: existingVote || null
      })
    };

  } catch (error) {
    console.error('❌ Error checking vote status:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};

