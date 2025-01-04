/*
 * Copyright (c) 2018 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-5-Clause
 */



#include "ble_services.h"
LOG_MODULE_REGISTER(LBS_SERVICE);

static bool notify_mysensor_enabled;
char decimal_value_str[12]; 

/* Service Declaration */
static struct bt_gatt_attr my_lbs_attrs[] = {
    BT_GATT_PRIMARY_SERVICE(BT_UUID_LBS),
    BT_GATT_CHARACTERISTIC(BT_UUID_LBS_MYSENSOR,
                           BT_GATT_CHRC_NOTIFY,
                           BT_GATT_PERM_NONE,
                           NULL, NULL, NULL),
    BT_GATT_CCC(mylbsbc_ccc_mysensor_cfg_changed,
                BT_GATT_PERM_READ | BT_GATT_PERM_WRITE),
};
 struct bt_gatt_service my_lbs_svc = BT_GATT_SERVICE(my_lbs_attrs);

static void mylbsbc_ccc_mysensor_cfg_changed(const struct bt_gatt_attr *attr, uint16_t value)
{
	LOG_INF("\n\rNotification  has been enabled = %d\n\r",value);
	notify_mysensor_enabled = (value == BT_GATT_CCC_NOTIFY);
	LOG_INF("CCCD changed for handle: 0x%04x, value: %d\n",
        attr->handle, value);

}


/* Define the function to send notifications for the MYSENSOR characteristic */
int my_lbs_send_sensor_notify(uint32_t ADC_valuess)
{
    if (!notify_mysensor_enabled) {
        LOG_WRN("Notifications are not enabled, skipping\n");
        return -EACCES;
    }

    snprintf(decimal_value_str, sizeof(decimal_value_str), "%u", ADC_valuess);

    LOG_INF("Send data = %s\n", decimal_value_str);
    LOG_INF("Sending notification from handle: 0x%04x", my_lbs_svc.attrs[1].handle);
	print_gatt_handles();

    int err = bt_gatt_notify(NULL, &my_lbs_svc.attrs[1], decimal_value_str, strlen(decimal_value_str));
    if (err) {
        LOG_WRN("Failed to send notification (err %d)\n", err);
    } else {
        LOG_INF("Notification sent: %s\n", decimal_value_str);
    }

    return err;
}

void print_gatt_handles(void)
{
    for (size_t i = 0; i < my_lbs_svc.attr_count; i++) {
        LOG_INF("Attribute[%zu]: Handle=0x%04x", i, my_lbs_svc.attrs[i].handle);
    }
}

