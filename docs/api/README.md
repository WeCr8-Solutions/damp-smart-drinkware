# 🔥 DAMP Smart Drinkware - API Documentation

## 📋 **API Overview**

The DAMP Smart Drinkware API is built on Firebase Cloud Functions, providing secure, scalable backend services for both web and mobile applications.

**Base URL**: `https://us-central1-damp-smart-drinkware.cloudfunctions.net`  
**Authentication**: Firebase JWT tokens  
**Format**: JSON  
**HTTPS**: Required  

## 🔐 **Authentication**

All API endpoints require Firebase authentication unless otherwise specified.

### **Authentication Header**
```http
Authorization: Bearer <firebase_jwt_token>
```

### **Getting a Token**
```javascript
// Client-side token retrieval
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;
if (user) {
  const token = await user.getIdToken();
  // Use token in API requests
}
```

## 🗳️ **Voting API**

### **Submit Vote**
Submit a vote for a product.

```http
POST /api/vote
```

**Request Body:**
```json
{
  "productId": "damp-handle-universal",
  "platform": "web"
}
```

**Response:**
```json
{
  "success": true,
  "voteId": "vote_123456789",
  "timestamp": "2024-12-19T10:30:00Z"
}
```

**Example:**
```javascript
const submitVote = async (productId) => {
  const response = await fetch('/api/vote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      productId,
      platform: 'web'
    })
  });
  
  return response.json();
};
```

### **Get Voting Results**
Retrieve current voting statistics.

```http
GET /api/voting/results
```

**Response:**
```json
{
  "results": [
    {
      "productId": "damp-handle-universal",
      "votes": 0,
      "percentage": 0
    },
    {
      "productId": "silicone-bottom-v1.0",
      "votes": 823,
      "percentage": 28.9
    }
  ],
  "totalVotes": 0,
  "lastUpdated": "2024-12-19T10:30:00Z"
}
```

### **Get User Voting History**
Retrieve a user's voting history.

```http
GET /api/voting/history
```

**Response:**
```json
{
  "votes": [
    {
      "voteId": "vote_123456789",
      "productId": "damp-handle-universal",
      "timestamp": "2024-12-19T10:30:00Z",
      "platform": "web"
    }
  ],
  "totalVotes": 5
}
```

## 🛒 **E-commerce API**

### **Create Checkout Session**
Create a Stripe checkout session for payment.

```http
POST /api/checkout/create-session
```

**Request Body:**
```json
{
  "items": [
    {
      "productId": "damp-handle-universal",
      "quantity": 1,
      "price": 4999
    }
  ],
  "successUrl": "https://dampdrink.com/success",
  "cancelUrl": "https://dampdrink.com/cart"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_123456789",
  "url": "https://checkout.stripe.com/pay/cs_test_123456789"
}
```

### **Process Pre-order**
Submit a pre-order for upcoming products.

```http
POST /api/preorder
```

**Request Body:**
```json
{
  "productId": "baby-bottle-v1.0",
  "email": "customer@example.com",
  "quantity": 1,
  "preferredColor": "blue"
}
```

**Response:**
```json
{
  "success": true,
  "preorderId": "preorder_123456789",
  "estimatedShipping": "Q1 2026"
}
```

### **Get Order History**
Retrieve user's order history.

```http
GET /api/orders/history
```

**Response:**
```json
{
  "orders": [
    {
      "orderId": "order_123456789",
      "items": [
        {
          "productId": "damp-handle-universal",
          "quantity": 1,
          "price": 4999
        }
      ],
      "total": 4999,
      "status": "shipped",
      "orderDate": "2024-12-19T10:30:00Z",
      "trackingNumber": "1Z999AA1234567890"
    }
  ]
}
```

## 👤 **User Management API**

### **Get User Profile**
Retrieve user profile information.

```http
GET /api/user/profile
```

**Response:**
```json
{
  "userId": "user_123456789",
  "email": "user@example.com",
  "displayName": "John Doe",
  "photoURL": "https://example.com/avatar.jpg",
  "preferences": {
    "hydrationGoal": 2500,
    "notifications": true,
    "theme": "light"
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "lastLogin": "2024-12-19T10:30:00Z"
}
```

### **Update User Profile**
Update user profile information.

```http
PUT /api/user/profile
```

**Request Body:**
```json
{
  "displayName": "John Doe",
  "preferences": {
    "hydrationGoal": 3000,
    "notifications": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "updatedAt": "2024-12-19T10:30:00Z"
}
```

### **Delete User Account**
Delete user account and all associated data.

```http
DELETE /api/user/account
```

**Response:**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

## 🥤 **Device Management API**

### **Register Device**
Register a new smart drinkware device.

```http
POST /api/devices/register
```

**Request Body:**
```json
{
  "deviceId": "DAMP001234",
  "deviceType": "damp-handle",
  "serialNumber": "DH-2024-001234",
  "firmwareVersion": "1.0.0"
}
```

**Response:**
```json
{
  "success": true,
  "deviceRegistrationId": "reg_123456789",
  "registeredAt": "2024-12-19T10:30:00Z"
}
```

### **Get User Devices**
Retrieve all devices registered to the user.

```http
GET /api/devices
```

**Response:**
```json
{
  "devices": [
    {
      "deviceId": "DAMP001234",
      "deviceType": "damp-handle",
      "nickname": "My Handle",
      "status": "online",
      "batteryLevel": 85,
      "lastSync": "2024-12-19T10:30:00Z",
      "firmwareVersion": "1.0.0"
    }
  ]
}
```

### **Update Device Data**
Submit device sensor data.

```http
POST /api/devices/{deviceId}/data
```

**Request Body:**
```json
{
  "temperature": 22.5,
  "volume": 450,
  "timestamp": "2024-12-19T10:30:00Z",
  "batteryLevel": 85
}
```

**Response:**
```json
{
  "success": true,
  "dataPointId": "data_123456789"
}
```

## 💧 **Hydration Tracking API**

### **Log Hydration Data**
Log daily hydration intake.

```http
POST /api/hydration/log
```

**Request Body:**
```json
{
  "amount": 250,
  "timestamp": "2024-12-19T10:30:00Z",
  "deviceId": "DAMP001234",
  "temperature": 22.5
}
```

**Response:**
```json
{
  "success": true,
  "logId": "hydration_123456789",
  "dailyTotal": 1750,
  "goalProgress": 0.7
}
```

### **Get Hydration History**
Retrieve hydration history for a date range.

```http
GET /api/hydration/history?startDate=2024-12-01&endDate=2024-12-19
```

**Response:**
```json
{
  "data": [
    {
      "date": "2024-12-19",
      "totalIntake": 2250,
      "goal": 2500,
      "goalAchieved": false,
      "sessions": [
        {
          "timestamp": "2024-12-19T08:00:00Z",
          "amount": 300,
          "deviceId": "DAMP001234"
        }
      ]
    }
  ],
  "summary": {
    "averageDailyIntake": 2100,
    "goalAchievementRate": 0.75,
    "totalDays": 19
  }
}
```

## 📊 **Analytics API**

### **Get User Analytics**
Retrieve user engagement analytics.

```http
GET /api/analytics/user
```

**Response:**
```json
{
  "engagement": {
    "totalSessions": 45,
    "averageSessionDuration": 180,
    "lastActiveDate": "2024-12-19T10:30:00Z",
    "totalVotes": 12,
    "devicesRegistered": 2
  },
  "hydration": {
    "averageDailyIntake": 2100,
    "goalAchievementRate": 0.75,
    "longestStreak": 14
  },
  "ecommerce": {
    "totalOrders": 3,
    "totalSpent": 14997,
    "averageOrderValue": 4999
  }
}
```

### **Get Product Analytics** (Admin Only)
Retrieve product performance analytics.

```http
GET /api/analytics/products
```

**Response:**
```json
{
  "products": [
    {
      "productId": "damp-handle-universal",
      "views": 15420,
      "votes": 1245,
      "preorders": 89,
      "conversionRate": 0.058
    }
  ],
  "totalViews": 42680,
  "totalVotes": 0,
  "totalPreorders": 234
}
```

## 🚨 **Error Responses**

### **Standard Error Format**
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request body is invalid",
    "details": {
      "field": "productId",
      "issue": "Required field missing"
    }
  },
  "timestamp": "2024-12-19T10:30:00Z"
}
```

### **Common Error Codes**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing authentication token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `INVALID_REQUEST` | 400 | Malformed request body or parameters |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

## 🔒 **Security Considerations**

### **Rate Limiting**
- **Voting**: 5 votes per minute per user
- **Device Data**: 100 requests per hour per device
- **General API**: 1000 requests per hour per user

### **Data Validation**
- All inputs are validated and sanitized
- SQL injection prevention
- XSS protection
- CSRF token validation

### **Privacy**
- User data is encrypted at rest and in transit
- Minimal data collection principle
- GDPR compliance
- User data deletion capabilities

## 📚 **SDK & Libraries**

### **JavaScript SDK**
```javascript
// DAMP API Client
class DAMPApiClient {
  constructor(authToken) {
    this.authToken = authToken;
    this.baseUrl = 'https://us-central1-damp-smart-drinkware.cloudfunctions.net';
  }
  
  async submitVote(productId) {
    return this.request('POST', '/api/vote', { productId });
  }
  
  async getVotingResults() {
    return this.request('GET', '/api/voting/results');
  }
  
  async request(method, endpoint, data = null) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: data ? JSON.stringify(data) : null
    });
    
    return response.json();
  }
}
```

### **React Native SDK**
```typescript
// React Native implementation
import { DAMPApiClient } from '@damp/api-client';
import { getAuth } from 'firebase/auth';

const useDAMPApi = () => {
  const [client, setClient] = useState<DAMPApiClient | null>(null);
  
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setClient(new DAMPApiClient(token));
      } else {
        setClient(null);
      }
    });
    
    return unsubscribe;
  }, []);
  
  return client;
};
```

## 🧪 **Testing**

### **API Testing**
```javascript
// Example test using Jest
describe('Voting API', () => {
  let apiClient;
  
  beforeEach(async () => {
    // Setup authenticated client
    apiClient = new DAMPApiClient(await getTestToken());
  });
  
  test('should submit vote successfully', async () => {
    const result = await apiClient.submitVote('damp-handle-universal');
    
    expect(result.success).toBe(true);
    expect(result.voteId).toBeDefined();
  });
  
  test('should get voting results', async () => {
    const results = await apiClient.getVotingResults();
    
    expect(results.results).toBeDefined();
    expect(results.totalVotes).toBeGreaterThan(0);
  });
});
```

### **Load Testing**
```bash
# Using Artillery.js for load testing
artillery quick --count 100 --num 10 https://us-central1-damp-smart-drinkware.cloudfunctions.net/api/voting/results
```

## 📞 **Support**

### **API Support**
- **Email**: api-support@wecr8.info
- **Documentation**: [API Docs](https://docs.dampdrink.com/api)
- **Status Page**: [status.dampdrink.com](https://status.dampdrink.com)

### **Rate Limit Increases**
For higher rate limits, contact: enterprise@wecr8.info

---

**API Version**: 1.0.0  
**Last Updated**: 2024-12-19  
**Maintained by**: WeCr8 Solutions LLC