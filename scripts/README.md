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

    # Database ID (use your existing database ID from Appwrite Console)
    # Note: Valid chars are a-z, A-Z, 0-9, and underscore. Can't start with underscore. Max 36 chars.
    APPWRITE_DATABASE_ID=68a99dc60017fcc36c2e
    ```

    **Important:** The `APPWRITE_API_KEY` should be a server API key with full permissions, not a client key.

## Available Scripts

### 1. Setup Collections

```bash
npm run db:setup
```

-   Creates the database structure (collections and attributes)
-   Sets up the following collections:
    -   **Organizations**: Tracks organizations and their Appwrite team for staff management
-   Creates indexes for optimal query performance
-   Idempotent: Safe to run multiple times (skips existing collections)

### 2. Reset Database

```bash
npm run db:reset
```

-   Deletes **ALL** data from your Appwrite project:
    -   All documents from collections (organizations, etc.)
    -   All users
-   Shows a 5-second warning before proceeding
-   Provides detailed progress and summary for each collection and users
-   Automatically skips collections that don't exist yet

### 3. Seed Database

```bash
npm run db:seed
```

-   Creates development users with different roles:
    -   **Public users** (3): For viewing tournaments and scores
    -   **Tournament organizers** (2): For creating and managing tournaments
    -   **Staff users** (3): For updating scores, events, and results
    -   **Test users** (2): For general testing purposes
    -   **Real admin users** (2): For testing first-time setup flow (no name set)

### 4. Reset and Seed (Combined)

```bash
npm run db:reset-and-seed
```

-   Combines both operations: reset then seed
-   Most convenient for development setup

## Collections Structure

### Organizations Collection

Tracks organizations that manage tournaments. Links to Appwrite teams for staff management.

**Attributes:**

-   `name` (string, required, unique): Organization name
-   `is_verified` (boolean, default: false): Whether the organization is verified
-   `is_community` (boolean, default: true): Whether it's a community organization
-   `appwrite_team_id` (string, optional, unique): Link to Appwrite team for staff management
-   `created_by` (string, required): Appwrite user ID of the creator
-   `created_at` (datetime, default: now): Creation timestamp
-   `updated_at` (datetime, default: now): Last update timestamp

**Indexes:**

-   Unique index on `name` for fast lookups and uniqueness constraint
-   Unique index on `appwrite_team_id` for linking with Appwrite teams
-   Index on `created_by` for querying organizations by creator
-   Index on `is_verified` for filtering verified organizations

**Permissions:**

-   Read: Anyone can view organizations
-   Create: Authenticated users can create organizations
-   Document-level security enabled for fine-grained access control

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

### Real Admin Users (First-Time Setup Testing)

-   `andre.fagl@gmail.com` - André Lima (admin, **name not set**)
-   `ana.cmb12@gmail.com` - Ana Lima (admin, **name not set**)

**Note:** These admin users are created without a name to test the set-name form flow on first login.

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
    # First, create the database structure
    npm run db:setup

    # Then, create development users
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

4. **Update database structure:**
    ```bash
    npm run db:setup
    ```
    Note: The setup script is idempotent and safe to run multiple times.

## Security Notes

-   Never commit your `.env` file to version control
-   Use different API keys for development and production
-   The server API key has full access - keep it secure
-   Test users are marked with `isTestUser: true` in preferences

## Extending the Scripts

### Adding More Collections to Reset Script

To include additional collections in the reset process, edit the `collections` array in `reset-database.ts`:

```typescript
const collections = [
    { id: "organizations", nameField: "name" },
    { id: "tournaments", nameField: "name" },
    { id: "teams", nameField: "name" },
    // Add more as needed
];
```

The `nameField` is used to display a friendly name in the console output when deleting documents.

### Adding More Development Users

To add more development users, edit the `developmentUsers` array in `seed-database.ts`. Each user should have:

```typescript
{
    type: "role-name",           // User role category
    name: "Display Name",        // User's display name (optional - if not set, user must complete setup on first login)
    email: "email@example.com",  // Login email (OTP authentication)
    labels: ["role", "permissions"] // User labels for role management
}
```
