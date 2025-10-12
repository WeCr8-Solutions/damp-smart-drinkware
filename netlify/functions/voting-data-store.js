/**
 * Shared Voting Data Store
 * Simple file-based persistence for voting data
 * In production, replace with Netlify Blob, Redis, or database
 */

const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join('/tmp', 'damp-voting-data.json');

// Default data structure
const DEFAULT_DATA = {
  products: {
    handle: { votes: 0, name: 'DAMP Handle v1.0' },
    siliconeBottom: { votes: 0, name: 'Silicone Bottom v1.0' },
    cupSleeve: { votes: 0, name: 'Cup Sleeve v1.0' },
    babyBottle: { votes: 0, name: 'Baby Bottle v1.0' }
  },
  votes: {}, // fingerprint/userId -> { productId, timestamp, type }
  totalVotes: 0,
  lastUpdated: new Date().toISOString()
};

/**
 * Load voting data from file
 */
async function loadData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist or is corrupted, return default
    console.log('📝 Creating new voting data file');
    await saveData(DEFAULT_DATA);
    return DEFAULT_DATA;
  }
}

/**
 * Save voting data to file
 */
async function saveData(data) {
  try {
    data.lastUpdated = new Date().toISOString();
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('❌ Failed to save voting data:', error);
    return false;
  }
}

/**
 * Check if a voter has already voted
 */
async function hasVoted(voterId) {
  const data = await loadData();
  return !!data.votes[voterId];
}

/**
 * Get existing vote for a voter
 */
async function getVote(voterId) {
  const data = await loadData();
  return data.votes[voterId] || null;
}

/**
 * Record a vote
 */
async function recordVote(voterId, productId, voteType) {
  const data = await loadData();

  // Check if already voted
  if (data.votes[voterId]) {
    return {
      success: false,
      error: 'already_voted',
      existingVote: data.votes[voterId]
    };
  }

  // Record the vote
  data.votes[voterId] = {
    productId,
    timestamp: Date.now(),
    type: voteType
  };

  // Increment product votes
  if (data.products[productId]) {
    data.products[productId].votes += 1;
    data.totalVotes += 1;
  }

  // Save to file
  await saveData(data);

  return {
    success: true,
    vote: data.votes[voterId],
    stats: {
      productVotes: data.products[productId].votes,
      totalVotes: data.totalVotes
    }
  };
}

/**
 * Get all voting results
 */
async function getResults() {
  const data = await loadData();
  
  const results = Object.entries(data.products).map(([id, productData]) => ({
    id,
    name: productData.name,
    votes: productData.votes,
    percentage: data.totalVotes > 0 
      ? Math.round((productData.votes / data.totalVotes) * 100) 
      : 0
  }));

  // Sort by votes (descending)
  results.sort((a, b) => b.votes - a.votes);

  return {
    results,
    totalVotes: data.totalVotes,
    lastUpdated: data.lastUpdated
  };
}

module.exports = {
  loadData,
  saveData,
  hasVoted,
  getVote,
  recordVote,
  getResults
};

