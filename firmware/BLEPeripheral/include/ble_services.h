/*
 * Copyright (c) 2018 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-5-Clause
 */

#ifndef BT_LBS_H_
#define BT_LBS_H_

#ifdef __cplusplus
extern "C" {
#endif

#include <zephyr/types.h>
#include <stddef.h>
#include <string.h>
#include <errno.h>
#include <zephyr/sys/printk.h>
#include <zephyr/sys/byteorder.h>
#include <zephyr/kernel.h>
#include <zephyr/logging/log.h>
#include <zephyr/bluetooth/bluetooth.h>
#include <zephyr/bluetooth/hci.h>
#include <zephyr/bluetooth/conn.h>
#include <zephyr/bluetooth/uuid.h>
#include <zephyr/bluetooth/gatt.h>
#include <stdlib.h>
// 6e400001-b5a3-f393-e0a9-e50e24dcca9e
/** @brief Service UUID. */
#define BT_UUID_LBS_VAL BT_UUID_128_ENCODE(0x6e400001, 0xb5a3, 0xf393, 0xe0a9, 0xe50e24dcca9e)

/* Assign a UUID to the MYSENSOR characteristic */
// 6e400002-b5a3-f393-e0a9-e50e24dcca9e
#define BT_UUID_LBS_MYSENSOR_VAL BT_UUID_128_ENCODE(0x6e400002, 0xb5a3, 0xf393, 0xe0a9, 0xe50e24dcca9e)


#define BT_UUID_LBS BT_UUID_DECLARE_128(BT_UUID_LBS_VAL)

/* Convert the array to a generic UUID */
#define BT_UUID_LBS_MYSENSOR BT_UUID_DECLARE_128(BT_UUID_LBS_MYSENSOR_VAL)
int my_lbs_send_sensor_notify(uint32_t ADC_value);
static void mylbsbc_ccc_mysensor_cfg_changed(const struct bt_gatt_attr *attr, uint16_t value);





#ifdef __cplusplus
}
#endif

#endif /* BT_LBS_H_ */


