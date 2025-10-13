const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle OPTIONS request (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const store = getStore('damp-emails');
    
    // Get waitlist data
    const emailsData = await store.get('waitlist', { type: 'json' }) || { emails: [], count: 0 };
    
    const count = emailsData.count || emailsData.emails?.length || 0;

    console.log(`📊 Waitlist count: ${count}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        count: count,
        lastUpdated: emailsData.lastUpdated || new Date().toISOString()
      }),
    };

  } catch (error) {
    console.error('❌ Error fetching waitlist count:', error);
    
    // Return 0 instead of error for graceful degradation
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        count: 0,
        lastUpdated: new Date().toISOString(),
        error: 'Could not fetch count'
      }),
    };
  }
};

