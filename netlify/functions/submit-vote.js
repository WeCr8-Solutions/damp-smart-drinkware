/**
 * Netlify Function: Submit Vote
 * Handles both public and authenticated voting with duplicate prevention
 * Uses shared file-based storage for vote persistence
 */

const { recordVote, getVote } = require('./voting-data-store');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    const { productId, fingerprint, userId, voteType } = JSON.parse(event.body);

    // Validate input
    if (!productId || !['handle', 'siliconeBottom', 'cupSleeve', 'babyBottle'].includes(productId)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid product ID' })
      };
    }

    if (voteType !== 'public' && voteType !== 'authenticated') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid vote type' })
      };
    }

    // Determine voter identifier
    const voterId = voteType === 'authenticated' ? userId : fingerprint;

    if (!voterId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing voter identifier' })
      };
    }

    // Check for duplicate vote using shared storage
    const existingVote = await getVote(voterId);
    if (existingVote) {
      const productNames = {
        handle: 'DAMP Handle v1.0',
        siliconeBottom: 'Silicone Bottom v1.0',
        cupSleeve: 'Cup Sleeve v1.0',
        babyBottle: 'Baby Bottle v1.0'
      };
      
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({
          error: 'Already voted',
          message: `You already voted for ${productNames[existingVote.productId]}`,
          existingVote
        })
      };
    }

    // Record the vote in shared storage
    const result = await recordVote(voterId, productId, voteType);

    if (!result.success) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({
          error: result.error,
          message: 'Vote could not be recorded',
          existingVote: result.existingVote
        })
      };
    }

    console.log(`✅ Vote recorded: ${productId} (${voteType}) - Total: ${result.stats.totalVotes}`);

    const productNames = {
      handle: 'DAMP Handle v1.0',
      siliconeBottom: 'Silicone Bottom v1.0',
      cupSleeve: 'Cup Sleeve v1.0',
      babyBottle: 'Baby Bottle v1.0'
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `Vote recorded for ${productNames[productId]}`,
        vote: result.vote,
        stats: result.stats
      })
    };

  } catch (error) {
    console.error('❌ Vote submission error:', error);
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

