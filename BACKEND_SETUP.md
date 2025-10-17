# Backend Setup Guide

This frontend application requires a backend API to connect to your PostgreSQL database. Below are the endpoints you need to implement.

## Architecture

```
Frontend (React) <---> Backend API <---> PostgreSQL Database
```

## Required Environment Variables

Create a `.env` file in your backend:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/Query_Template_Tool
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
PORT=3000
```

## Database Session Configuration

Before each query, set session variables for RLS:

```sql
SET app.user_id = '<user_uuid>';
SET app.role = 'user' | 'admin' | 'superadmin';
SET app.publisher_id = '<publisher_uuid>';
```

## API Endpoints

### Authentication

#### POST `/api/auth/google`
Verify Google OAuth token and create/login user

**Request Body:**
```json
{
  "idToken": "google_id_token"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "publisher_id": "uuid",
    "username": "string",
    "email": "string",
    "full_name": "string",
    "role": "user|admin|superadmin",
    "is_active": true
  }
}
```

**Logic:**
1. Verify Google ID token
2. Check if user exists by email
3. If new user:
   - Create user with role='user'
   - Assign to default publisher
4. Generate JWT token
5. Return token + user data

#### GET `/api/auth/me`
Get current user info

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:** User object (same as login)

### Templates

#### GET `/api/templates`
Get all templates for user's publisher

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "publisher_id": "uuid",
    "doc_name": "string",
    "query_type": "string",
    "specific_query_heading": "string|null",
    "template_text": "string",
    "created_by": "uuid",
    "created_at": "timestamp",
    "modified_at": "timestamp"
  }
]
```

**SQL Query:**
```sql
SELECT * FROM app.document_items 
WHERE publisher_id = :publisher_id
ORDER BY doc_name;
```

#### POST `/api/templates/:id/copy`
Track template copy by user

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true
}
```

**SQL Call:**
```sql
SELECT app.increment_document_copy_count(
  :user_id::uuid,
  :document_item_id::uuid,
  '{"source": "web"}'::jsonb
);
```

### Role Requests

#### POST `/api/role-requests`
Create a new role request

**Request Body:**
```json
{
  "requested_role": "admin|superadmin",
  "requested_publisher_id": "uuid" // optional, required for admin
}
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "requested_role": "admin",
  "status": "pending",
  "requested_at": "timestamp"
}
```

**Note:** You'll need to create this table:
```sql
CREATE TABLE app.role_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app.users(id),
  requested_role app.role_enum NOT NULL,
  requested_publisher_id UUID REFERENCES app.publishers(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES app.users(id),
  reviewed_at TIMESTAMPTZ
);
```

#### GET `/api/role-requests`
Get role requests (filtered by role)

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "requested_role": "admin",
    "status": "pending",
    "requested_at": "timestamp",
    "user": {
      "full_name": "string",
      "email": "string"
    }
  }
]
```

**Logic:**
- Users: see only their own requests
- Admins: see requests for their publisher
- Superadmins: see all requests

#### PATCH `/api/role-requests/:id`
Approve or reject role request

**Request Body:**
```json
{
  "status": "approved|rejected"
}
```

**Logic (if approved):**
```sql
-- Update user role
UPDATE app.users 
SET role = :requested_role
WHERE id = :user_id;

-- Update request
UPDATE app.role_requests
SET status = 'approved',
    reviewed_by = :current_user_id,
    reviewed_at = now()
WHERE id = :request_id;
```

### Analytics

#### GET `/api/analytics`
Get analytics data

**Response:**
```json
{
  "total_users": 0,
  "total_templates": 0,
  "total_copies": 0,
  "top_templates": [
    {
      "document_item_id": "uuid",
      "doc_name": "string",
      "total_copies": 0
    }
  ]
}
```

**SQL Queries:**
```sql
-- Total users (filter by publisher for admin)
SELECT COUNT(*) FROM app.users WHERE publisher_id = :publisher_id;

-- Total templates
SELECT COUNT(*) FROM app.document_items WHERE publisher_id = :publisher_id;

-- Total copies
SELECT SUM(copied_count) FROM app.user_template_activity WHERE publisher_id = :publisher_id;

-- Top templates
SELECT * FROM app.v_top_document_items 
WHERE publisher_id = :publisher_id
LIMIT 10;
```

### User Management

#### GET `/api/users`
Get users (filtered by role)

**Logic:**
- Admins: see users in their publisher
- Superadmins: see all users

#### GET `/api/publishers`
Get all publishers

**Only for admins/superadmins**

## Recommended Backend Stack

### Option 1: Node.js + Express
```bash
npm init -y
npm install express pg jsonwebtoken google-auth-library cors dotenv
```

### Option 2: Python + FastAPI
```bash
pip install fastapi uvicorn psycopg2-binary pyjwt google-auth python-dotenv
```

### Option 3: Python + Flask
```bash
pip install flask psycopg2-binary pyjwt google-auth python-dotenv flask-cors
```

## Example Middleware (Node.js)

```javascript
const jwt = require('jsonwebtoken');

async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Set PostgreSQL session variables
    await pool.query(`SET app.user_id = '${decoded.id}'`);
    await pool.query(`SET app.role = '${decoded.role}'`);
    await pool.query(`SET app.publisher_id = '${decoded.publisher_id}'`);
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

## Frontend Configuration

Update `.env.local` in your frontend:

```env
VITE_API_URL=http://localhost:3000/api
```

## Testing

Use the following test flow:
1. Start your backend server
2. Start the frontend: `npm run dev`
3. Click "Sign in with Google" (will show alert for now)
4. After backend integration, test each role:
   - User: Access templates, request role
   - Admin: Approve requests, view publisher analytics
   - Superadmin: Global access, all analytics

## Security Notes

1. Always validate JWT tokens
2. Use HTTPS in production
3. Set session variables for every query
4. Validate user permissions before data access
5. Use prepared statements to prevent SQL injection
6. Store JWT_SECRET securely (never commit to git)
7. Configure CORS properly
