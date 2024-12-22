FROM mcr.microsoft.com/vscode/devcontainers/base:ubuntu-22.04

# Install common tools
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    git \
    curl \
    wget \
    make \
    cmake \
    build-essential \
    python3-pip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*