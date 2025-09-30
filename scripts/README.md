# Database Scripts for MatchFever Mobile

This directory contains TypeScript scripts to manage your Appwrite database during development.

## Prerequisites

1. **Install dependencies:**

    ```bash
    npm install
    ```

2. **Set up environment variables:**
   Create a `.env` file in the project root with the following variables:

    ```env
    # Appwrite Configuration (same as your app)
    EXPO_PUBLIC_APPWRITE_ENDPOINT=https://your-appwrite-endpoint.com/v1
    EXPO_PUBLIC_APPWRITE_PROJECT_ID=your-project-id

    # Server API Key (required for admin operations)
    APPWRITE_API_KEY=your-server-api-key
    ```

    **Important:** The `APPWRITE_API_KEY` should be a server API key with full permissions, not a client key.

## Available Scripts

### 1. Reset Database

```bash
npm run db:reset
```

-   Deletes **ALL** users from your Appwrite project
-   Shows a 5-second warning before proceeding
-   Provides detailed progress and summary

### 2. Seed Database

```bash
npm run db:seed
```

-   Creates development users with different roles:
    -   **Public users** (3): For viewing tournaments and scores
    -   **Tournament organizers** (2): For creating and managing tournaments
    -   **Staff users** (3): For updating scores, events, and results
    -   **Test users** (2): For general testing purposes

### 3. Reset and Seed (Combined)

```bash
npm run db:reset-and-seed
```

-   Combines both operations: reset then seed
-   Most convenient for development setup

## Development Users Created

The seed script creates the following users (using OTP authentication):

### Public Users (Viewers)

-   `andre.fagl+johnviewer@gmail.com` - John Viewer
-   `andre.fagl+sarahfan@gmail.com` - Sarah Fan
-   `andre.fagl+mikesports@gmail.com` - Mike Sports

### Tournament Organizers

-   `andre.fagl+emmaorganizer@gmail.com` - Emma Organizer
-   `andre.fagl+davidmanager@gmail.com` - David Manager

### Staff Users

-   `andre.fagl+lisastaff@gmail.com` - Lisa Staff
-   `andre.fagl+tomreferee@gmail.com` - Tom Referee
-   `andre.fagl+annaadmin@gmail.com` - Anna Admin (has all permissions)

### Test Users

-   `andre.fagl+testuser1@gmail.com` - Test User 1 (public role)
-   `andre.fagl+testuser2@gmail.com` - Test User 2 (organizer role)

## User Roles and Permissions

Each user is assigned labels and preferences that define their role:

-   **Public**: Can view tournaments, scores, and statistics
-   **Organizer**: Can create and manage tournaments
-   **Staff**: Can update scores, events, and results
-   **Admin**: Has all permissions

### User Preferences Structure

The script stores user permissions as flattened preferences to avoid Appwrite's `[object Object]` display issue:

```json
{
    "userType": "organizer",
    "canView": true,
    "canCreateTournaments": true,
    "canUpdateScores": false,
    "canManageUsers": false,
    "createdAt": "2025-09-30T01:57:37.750Z",
    "isTestUser": true
}
```

## Safety Features

-   **Confirmation prompt**: Reset script waits 5 seconds before deletion
-   **Environment validation**: Scripts check for required environment variables
-   **Error handling**: Detailed error messages and graceful failure handling
-   **Progress tracking**: Real-time feedback during operations

## Troubleshooting

### "Project with the requested ID could not be found"

-   Check your `EXPO_PUBLIC_APPWRITE_PROJECT_ID` in the `.env` file
-   Ensure your Appwrite endpoint is correct

### "Invalid API key"

-   Verify your `APPWRITE_API_KEY` is a server API key (not client key)
-   Check that the API key has the necessary permissions

### "Rate limiting errors"

-   The scripts include delays to prevent rate limiting
-   If you encounter issues, try running the scripts again after a few minutes

## Development Workflow

1. **Initial setup:**

    ```bash
    npm run db:reset-and-seed
    ```

2. **Reset when needed:**

    ```bash
    npm run db:reset
    ```

3. **Add more test data:**
    ```bash
    npm run db:seed
    ```

## Security Notes

-   Never commit your `.env` file to version control
-   Use different API keys for development and production
-   The server API key has full access - keep it secure
-   Test users are marked with `isTestUser: true` in preferences

## Extending the Scripts

To add more development users, edit the `developmentUsers` array in `seed-database.ts`. Each user should have:

```typescript
{
    type: "role-name",           // User role category
    name: "Display Name",        // User's display name
    email: "email@example.com",  // Login email
    password: "password123",     // Login password
    labels: ["role", "permissions"] // User labels for role management
}
```

### TypeScript Benefits

The scripts now provide:

-   **Type Safety**: Catch errors at compile time
-   **Better IntelliSense**: Auto-completion in your IDE
-   **Proper Interfaces**: Clear data structures
-   **Runtime Safety**: Better error handling
