const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle OPTIONS request (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const store = getStore('damp-emails');

    // GET - Retrieve email count
    if (event.httpMethod === 'GET') {
      const emailsData = await store.get('waitlist', { type: 'json' }) || { emails: [], count: 0 };
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          count: emailsData.count || emailsData.emails?.length || 0,
          lastUpdated: new Date().toISOString()
        }),
      };
    }

    // POST - Save email
    if (event.httpMethod === 'POST') {
      const { email, source = 'waitlist', name = '' } = JSON.parse(event.body || '{}');

      if (!email || !email.includes('@')) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Valid email required' }),
        };
      }

      // Get existing emails
      const emailsData = await store.get('waitlist', { type: 'json' }) || { emails: [], count: 0 };
      
      // Check if email already exists
      const existingEmail = emailsData.emails?.find(e => e.email === email.toLowerCase());
      if (existingEmail) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            message: 'Email already registered',
            count: emailsData.count || emailsData.emails.length,
            alreadyExists: true
          }),
        };
      }

      // Add new email
      const newEntry = {
        email: email.toLowerCase(),
        name: name,
        source: source,
        timestamp: new Date().toISOString(),
        ip: event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown'
      };

      const updatedEmails = [...(emailsData.emails || []), newEntry];
      
      // Save to blob store
      await store.setJSON('waitlist', {
        emails: updatedEmails,
        count: updatedEmails.length,
        lastUpdated: new Date().toISOString()
      });

      console.log(`✅ Email saved: ${email} (${source}) - Total: ${updatedEmails.length}`);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Email saved successfully',
          count: updatedEmails.length
        }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };

  } catch (error) {
    console.error('❌ Error saving email:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to save email',
        message: error.message
      }),
    };
  }
};

