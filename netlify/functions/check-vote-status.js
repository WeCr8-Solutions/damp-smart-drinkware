/**
 * Netlify Function: Check Vote Status
 * Checks if a user/device has already voted using shared storage
 */

const { hasVoted, getVote } = require('./voting-data-store');

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

    const voted = await hasVoted(voterId);
    const existingVote = voted ? await getVote(voterId) : null;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        hasVoted: voted,
        vote: existingVote
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

