# GitHub Build Cache Provider

A build cache provider for Expo that stores builds on GitHub Releases for faster subsequent builds.

## What It Does

When you run `npx expo run:ios` or `npx expo run:android`:

1. **Cache Check**: The provider checks if a build with the same fingerprint already exists
2. **Cache Hit**: If found, it downloads and uses the cached build (saves build time)
3. **Cache Miss**: If not found, it builds normally and uploads the result to GitHub Releases
4. **Future Builds**: Subsequent builds with the same fingerprint will use the cached version

## Setup

### 1. Environment Variables

Create a `.env` file in your project root:

```bash
# Required
GITHUB_TOKEN=your_github_personal_access_token

# Optional (with defaults)
BUILD_CACHE_PROVIDER_MAX_RETRIES=3
BUILD_CACHE_PROVIDER_RETRY_DELAY=1000
BUILD_CACHE_PROVIDER_TIMEOUT=30000
BUILD_CACHE_PROVIDER_DEBUG=false
```

### 2. App Configuration

Add the build cache provider to your `app.json`:

```json
{
    "expo": {
        "experiments": {
            "buildCacheProvider": {
                "plugin": "./provider.plugin.js",
                "options": {
                    "owner": "your_github_username",
                    "repo": "your_repository_name"
                }
            }
        }
    }
}
```

### 3. Build the Provider

```bash
npm run build:cache-provider
```

## How It Works

The provider creates GitHub releases with tags like:

- `fingerprint.{hash}.dev-client` for development builds
- `fingerprint.{hash}` for production builds

Each build is uniquely identified by its fingerprint hash, ensuring that identical builds use the cache while different builds create new releases.

## Troubleshooting

### "ENOENT: no such file or directory, open '.../Info.plist'"

This usually means the local cached `.app` bundle is missing `Info.plist` (corrupt or incomplete cache). The provider now detects this and will re-download or rebuild automatically. To force a clean slate, clear the local cache:

```bash
rm -rf "$(node -e "const path=require('path');const os=require('os');console.log(path.join(os.tmpdir(),'github-build-cache-provider','build-run-cache'))")"
```

Then run `npx expo run:ios` again.

## Requirements

- **Node.js 18+** (for native fetch API)
- **GitHub Personal Access Token** with "contents" permissions
- **Expo SDK 53+** (for build cache provider support)
- **TypeScript** (for building the provider)
