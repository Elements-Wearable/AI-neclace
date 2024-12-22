FROM mcr.microsoft.com/vscode/devcontainers/python:3.9

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | python3 -

# Install development tools
RUN pip install --no-cache-dir \
    black \
    pylint \
    pytest \
    pytest-cov