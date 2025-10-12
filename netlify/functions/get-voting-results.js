/**
 * Netlify Function: Get Voting Results
 * Returns current voting statistics
 */

// Shared voting data (in production, this would be in a database)
// This is a simple in-memory store for now
const votingData = {
  products: {
    handle: { votes: 0, name: 'DAMP Handle v1.0' },
    siliconeBottom: { votes: 0, name: 'Silicone Bottom v1.0' },
    cupSleeve: { votes: 0, name: 'Cup Sleeve v1.0' },
    babyBottle: { votes: 0, name: 'Baby Bottle v1.0' }
  },
  totalVotes: 0
};

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
    // Calculate percentages
    const results = Object.entries(votingData.products).map(([id, data]) => ({
      id,
      name: data.name,
      votes: data.votes,
      percentage: votingData.totalVotes > 0 
        ? Math.round((data.votes / votingData.totalVotes) * 100) 
        : 0
    }));

    // Sort by votes (descending)
    results.sort((a, b) => b.votes - a.votes);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        results,
        totalVotes: votingData.totalVotes,
        lastUpdated: new Date().toISOString()
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

