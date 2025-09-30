# MatchFever Mobile App

A cross-platform mobile app built in React Native for creating and managing sports tournaments with live match results and team standings throughout the competition.

## Table of Contents
- [Requirements](#requirements) 
- [Quick Start](#-quick-start)
- [Development Setup](#️-development-setup)
    - [Install Dependencies](#1-install-dependencies)
    - [Pre-build Setup](#2-pre-build-setup)
    - [Environment Configuration](#3-environment-configuration)
    - [Running the Project](#4-running-the-project)
- [Tech Stack](#️-tech-stack)
- [Platform Support](#-platform-support)
- [Getting Help](#getting-help)
- [License](#-license)

## 📋 Requirements

Before setting up the development environment, ensure you have the following installed:

- **Node.js and NPM** - Version 22.12.0+
- **Xcode** - Latest version for iOS development
- **Xcode Command Line Tools** - Required for iOS development
- **iOS Simulator** - For testing on iOS devices

## 🚀 Quick Start

### Clone the Project

```
git clone git@github.com:andrefagl/matchfever-mobile.git
```
```
cd matchfever-mobile
```

## 🛠️ Development Setup

### 1. Install Dependencies

```bash
npm install
```
### 2. Follow the Expo development docs

Set up your environment to [start building with Expo](https://docs.expo.dev/get-started/set-up-your-environment/?platform=ios&device=simulated&mode=development-build&buildEnv=local) based on your personal preferences for development.

We suggest chosing **iOS Simulator** / **Android Emulator** and **Development Build.**

We also adopted the concept of [Continuous Native Generation (CNG)](https://docs.expo.dev/workflow/continuous-native-generation/)

### 3. Build cache provider

```bash
npm run build:cache-provider
```

### 4. Pre-build mobile application

Run the pre-build command to prepare the native code:

```bash
npx expo prebuild --clean
```

### 5. Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
GITHUB_TOKEN=<your_github_token>
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=matchfever
EXPO_PUBLIC_APPWRITE_PLATFORM=com.digitalalpha.matchfever
EXPO_PUBLIC_APPWRITE_DEV_KEY=<your_appwrite_dev_key>
```
- A **GitHub token** is required during the build process to determine whether to use a cached build or create a new one.
- **AppWrite** tokens are required to connect the app with backend infrastructure 

> [!NOTE]
> Don't have the credentials, ask the mantainers.

### 6. Running the Project

#### iOS Development
```bash
npm run ios
```

#### Android Development
```bash
npm run android
```

## 🛠️ Tech Stack

- **[React Native](https://reactnative.dev)** - Mobile framework
- **[Expo](https://expo.dev)** - Development platform
- **[Expo Router](https://docs.expo.dev/versions/latest/sdk/router/)** - File-based routing
- **[TypeScript](https://www.typescriptlang.org)** - Type safety
- **[NativeWind](https://www.nativewind.dev)** - Tailwind CSS for React Native
- **[Gluestack UI](https://gluestack.io)** - Component library
- **[Appwrite](https://appwrite.io)** - Backend services
- **[React Hook Form](https://react-hook-form.com)** - Form management
- **[Zod](https://zod.dev)** - Schema validation

## 📱 Platform Support

- **iOS** - Bundle ID: `com.digitalalpha.matchfever`
- **Android** - Package: `com.digitalalpha.matchfever`

### Getting Help

If you encounter any issues during setup, please check:
1. All requirements are properly installed
2. Environment variables are correctly configured
3. Dependencies are up to date
4. Expo CLI is properly configured

## 📄 License

This project is private and proprietary to MatchFever.

---

**Happy coding! 🎉**

