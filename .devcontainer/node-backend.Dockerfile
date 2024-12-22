FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:18

# Install global packages
RUN npm install -g \
    typescript \
    ts-node \
    nodemon \
    eslint \
    prettier