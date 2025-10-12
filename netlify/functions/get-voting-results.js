/**
 * Netlify Function: Get Voting Results
 * Returns current voting statistics from shared storage
 */

const { getResults: getResultsFromStore } = require('./voting-data-store');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=10' // Cache for 10 seconds
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Get results from shared storage
    const data = await getResultsFromStore();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        ...data
      })
    };

  } catch (error) {
    console.error('❌ Error fetching results:', error);
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

