cmake_minimum_required(VERSION 3.20.0)
# set(ZEPHYR_EXTRA_MODULES "${CMAKE_SOURCE_DIR}/modules/NAU7802_LOADCELL")
find_package(Zephyr REQUIRED HINTS $ENV{ZEPHYR_BASE})

project(smartNecklaceFirmware)


#INCLUDES
target_include_directories(app PRIVATE BLEPeripheral/include)
target_include_directories(app PRIVATE adcdata/include)

#INTERFACE SOURCE FILES
file(GLOB BLEPeripheralSources BLEPeripheral/src/*.c)
target_sources(app PRIVATE ${BLEPeripheralSources})
file(GLOB adcdataSources adcdata/src/*.c)
target_sources(app PRIVATE ${adcdataSources})

target_sources(app PRIVATE src/main.c)





# NORDIC SDK APP END
# zephyr_library_include_directories(.)
