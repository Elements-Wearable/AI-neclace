
 Peripheral Firmware
Overview
This firmware is designed for the nRF52840 microcontroller, configured as a Bluetooth Low Energy (BLE) peripheral. It advertises over BLE, initializes the ADC (Analog-to-Digital Converter), and sends ADC values every 2 seconds using BLE notifications.

Prerequisites:
Ensure the following tools are installed and properly configured:
nRF Connect SDK: Version 2.5.0
Toolchain: Version 2.5.0

Features:
BLE Peripheral Functionality:

The nRF52840 operates as a BLE peripheral device.
Advertises its presence to BLE central devices (e.g., smartphones or BLE scanners).
ADC Integration:
The firmware initializes the ADC to read analog signals. Later it will be replaced with actual desired values, adc values are just used for testing only at this stage.

Data Transmission:
ADC values are sent to connected BLE central devices every 2 seconds.
BLE notifications are used for data transmission.
Installation:
Install the nRF Connect SDK and set up the toolchain (2.5.0).
Clone or download the firmware project to your local development environment.
nRF Connect SDK extension is beign used in vs code for development.
choose "nrf52840dk_nrf52840" if you are using nrf52840 DK
and choose "xiao_ble_sense" if you are using Xiao Saeed Studio nrf52840 sense module.
Flash the firmware onto the nRF52840 board using a compatible programmer/debugger (e.g., J-Link).

Testing:
for testing, you can use nRF Connect for mobile app. (which will act as Central device.)

