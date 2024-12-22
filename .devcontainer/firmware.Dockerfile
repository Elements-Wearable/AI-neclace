FROM zephyrprojectrtos/zephyr-build:latest

# Install additional tools
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    gdb-multiarch \
    openocd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install West
RUN pip3 install --no-cache-dir west