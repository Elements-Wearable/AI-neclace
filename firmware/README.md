
AI-Necklace BLE-Peripheral Firmware
Overview
This firmware is designed for the nRF52840 microcontroller, configured as a Bluetooth Low Energy (BLE) peripheral. It advertises over BLE, initializes the ADC (Analog-to-Digital Converter), and sends ADC values every 2 seconds using BLE notifications.

Prerequisites
Ensure the following tools are installed and properly configured:

nRF Connect SDK: Version 2.5.0
Toolchain: Version 2.5.0
Features
BLE Peripheral Functionality

The nRF52840 operates as a BLE peripheral device.
Advertises its presence to BLE central devices (e.g., smartphones or BLE scanners).
ADC Integration

The firmware initializes the ADC to read analog signals.
At this stage, ADC values are placeholders and will be replaced with desired values later.
Data Transmission

ADC values are sent to connected BLE central devices every 2 seconds.
BLE notifications are used for data transmission.
Extendable BLE Services and Characteristics

Additional BLE services and characteristics can be added in the future to support other data types and use cases as needed.
Installation
Install the nRF Connect SDK and set up the toolchain (2.5.0).
Clone or download the firmware project to your local development environment.
Use the nRF Connect SDK extension in Visual Studio Code for development.
Select the correct board for your project:
seeed_xiao_nrf52840_sense for the Seeed Studio Xiao nRF52840 Sense.
nrf52840dk_nrf52840 if you're using the nRF52840 Development Kit (DK).
Flashing the Firmware
There are two ways to flash the firmware onto the Seeed Studio Xiao nRF52840 Sense:

1. Using a Programmer/Debugger (e.g., J-Link):
Build the project in vs code,and flash it.
Ensure your programmer/debugger is properly connected to the board.
2. Using the .uf2 File(Recommended method):
If you're using the Seeed Studio Xiao nRF52840 Sense, which supports UF2 bootloading:

Build the project in vs code.
Locate the zephyr.uf2 file in the build/zephyr directory:

Put the board in bootloader mode:
Double-press the reset button on the board.
The board will appear as a USB mass storage device.
Drag-and-drop the zephyr.uf2 file onto the USB drive.
The board will automatically flash the firmware and reboot.
Testing
Use the nRF Connect for Mobile app (available on iOS and Android) to test the firmware.
The app acts as a BLE Central device to connect to your board.
Verify the BLE advertising and check for ADC notifications every 2 seconds.
