AI-Necklace BLE-Peripheral Firmware
Overview
This firmware is designed for the nRF52840 microcontroller, configured as a Bluetooth Low Energy (BLE) peripheral. It advertises over BLE, initializes the ADC (Analog-to-Digital 
Converter), and sends ADC values every 2 seconds using BLE notifications.

Prerequisites
Ensure the following tools are installed and properly configured:

nRF Connect SDK: Version 2.5.0
Download from Nordic Semiconductor's nRF Connect SDK website.
This includes the Zephyr RTOS and required toolchain.

Toolchain Version: 2.5.0
Installed automatically with the nRF Connect SDK toolchain.

Features
BLE Peripheral Functionality:

The nRF52840 operates as a BLE peripheral device.
Advertises its presence to BLE central devices (e.g., smartphones or BLE scanners).
ADC Integration:

The firmware initializes the ADC to read analog signals.
At this stage, ADC values are placeholders and will be replaced with actual desired values later.
Data Transmission:

ADC values are sent to connected BLE central devices every 2 seconds.
BLE notifications are used for data transmission.
Extendable BLE Services and Characteristics:

Additional BLE services and characteristics can be added in the future to support other data types and use cases.
Installation
Install the nRF Connect SDK and set up the toolchain (Version 2.5.0).
Follow the official installation guide:
Getting Started with nRF Connect SDK.

Clone or download the firmware project to your local development environment:

git clone <repository-url>
cd <project-directory>
Use the nRF Connect SDK extension in Visual Studio Code for development.

Select the correct board for your project:

seeed_xiao_nrf52840_sense for the Seeed Studio Xiao nRF52840 Sense.
nrf52840dk_nrf52840 if you're using the nRF52840 Development Kit (DK).
Flashing the Firmware
There are two ways to flash the firmware onto the Seeed Studio Xiao nRF52840 Sense:

1. Using a Programmer/Debugger (e.g., J-Link):
Build the project in Visual Studio Code or CLI.
Ensure your programmer/debugger is properly connected to the board.
Flash the firmware using vs code externsion or via the west flash command:
west flash
2. Using the .UF2 File (Recommended):
If you're using the Seeed Studio Xiao nRF52840 Sense, which supports UF2 bootloading:
Build the project in Visual Studio Code or CLI.
Locate the zephyr.uf2 file in the build/zephyr directory.
Put the board in bootloader mode:
Double-press the reset button on the board.
The board will appear as a USB mass storage device.
Drag-and-drop the zephyr.uf2 file onto the USB drive.
The board will automatically flash the firmware and reboot.
Testing
Use the nRF Connect for Mobile app (available on iOS and Android) to test the firmware:

The app acts as a BLE Central device to connect to your board.
Verify BLE advertising and check for ADC notifications every 2 seconds.

Building via CLI
To build the project using CLI, follow these steps:

1. Install Dependencies
Install a Zephyr SDK (3.4.99) that contains all required tools and dependencies, such as CMake, Python, etc.
Follow the guide here: Zephyr Getting Started.  https://docs.zephyrproject.org/latest/develop/getting_started/index.html

Install nRF Command Line Tools (required for flashing/debugging):
Download from nRF Command Line Tools: https://www.nordicsemi.com/Products/Development-tools/nRF-Command-Line-Tools/Download

Install West (Zephyr's project management tool):
pip3 install --user west
2. Initialize and Update the Project
make sure to initialize and update west if its not already done.

3. Build the Firmware
Run the following commands to build the firmware:
Build the firmware for your target board:
For Seeed Studio Xiao nRF52840 Sense:
west build -b seeed_xiao_nrf52840_sense ..
For nRF52840 DK:
west build -b nrf52840dk_nrf52840 ..

4. Flash the Firmware
To flash the firmware, use one of the following methods:

For flashing via J-Link or other programmers:
west flash
For UF2 bootloading:
Follow the drag-and-drop process described in the Flashing the Firmware section above.

