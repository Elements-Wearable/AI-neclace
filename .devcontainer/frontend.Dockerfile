FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:18

# Install Expo CLI
RUN npm install -g expo-cli

# Install Android SDK and tools for mobile development
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    openjdk-11-jdk \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*