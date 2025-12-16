# Google OAuth Setup Instructions

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Educational Enrollment Platform"
4. Click "Create"

## Step 2: Enable Google+ API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

## Step 3: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure OAuth consent screen:
   - User Type: External
   - App name: Educational Enrollment Platform
   - User support email: Your email
   - Developer contact: Your email
   - Save and Continue (skip optional fields)
   - Add scopes: Select "email" and "profile"
   - Save and Continue
   - Add test users (your email)
   - Save

4. Back to Create OAuth client ID:
   - Application type: **Web application**
   - Name: Educational Platform OAuth
   
5. Add Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
   
6. Click "Create"

7. **Copy the Client ID and Client Secret** that appear

## Step 4: Update Your .env File

Add these to your `.env` file (not .env.example):

```env
GOOGLE_CLIENT_ID=your-actual-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

## Step 5: Run Database Migration

```bash
npm run prisma:migrate
```

When prompted for migration name, enter: `add_oauth_and_logout`

## Step 6: Install Dependencies

```bash
npm install
```

## Step 7: Restart Server

```bash
npm run dev
```

## Step 8: Test Google Login

1. Open browser and go to:
   ```
   http://localhost:3000/api/auth/google
   ```

2. You should be redirected to Google login
3. After login, you'll be redirected back with a JWT token

## Frontend Integration

In your React frontend, add a button:

```jsx
<a href="http://localhost:3000/api/auth/google">
  <button>Sign in with Google</button>
</a>
```

The callback will redirect to:
```
http://localhost:5173/auth/google/success?token=YOUR_JWT_TOKEN
```

Extract the token from URL and store it in localStorage.

## Production Setup

When deploying to production, update:

1. Google Console → Add production callback URL:
   ```
   https://yourdomain.com/api/auth/google/callback
   ```

2. Update .env:
   ```
   GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
   FRONTEND_URL=https://yourfrontend.com
   ```

## Testing

Test the new features:

### 1. Google Login
```
GET http://localhost:3000/api/auth/google
```

### 2. Logout
```bash
POST http://localhost:3000/api/auth/logout
Authorization: Bearer YOUR_TOKEN
```

### 3. Delete Account
```bash
DELETE http://localhost:3000/api/auth/account
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "password": "yourpassword"  # Only for local accounts
}
```
