#include <zephyr/types.h>

#include <zephyr/kernel.h>
#include <zephyr/device.h>
#include <zephyr/sys/printk.h>
#include <zephyr/drivers/adc.h>
#include <zephyr/drivers/gpio.h>
#include <stdlib.h>
#include <stdio.h>
#include <zephyr/sys/reboot.h>
#include <zephyr/logging/log.h>
#include <zephyr/bluetooth/bluetooth.h>
#include <zephyr/bluetooth/gap.h>
#include <zephyr/bluetooth/uuid.h>
#include <zephyr/bluetooth/conn.h>
#include <zephyr/bluetooth/gatt.h>
#include <zephyr/bluetooth/hci.h>
#include <zephyr/device.h>

#include "../adcdata/include/adcvalues.h"
#include "../BLEPeripheral/include/ble_services.h"
#include "ble_helper.h"
#include <zephyr/pm/pm.h>
#include <zephyr/pm/device.h>
#include <zephyr/pm/policy.h>
#include <nrf.h>
#include <nrfx_power.h>

#define STACKSIZE 1024
#define PRIORITY 7
int err;
void start_advertising(void);
int my_lbs_send_sensor_notify(uint32_t ADC_value);

static struct bt_le_ext_adv *adv;
extern struct bt_gatt_service_static my_lbs_svc;

bool is_ble_connected = false;
LOG_MODULE_REGISTER(PERIPHERALNODE);

static const char *phy2str(uint8_t phy)
{
	switch (phy)
	{
	case 0:
		return "No packets";
	case BT_GAP_LE_PHY_1M:
		return "LE 1M";
	case BT_GAP_LE_PHY_2M:
		return "LE 2M";
	case BT_GAP_LE_PHY_CODED:
		return "LE Coded";
	default:
		return "Unknown";
	}
}

void send_data_thread(void)
{
	int count = 0;
	while (1 && is_ble_connected)
	{

		uint32_t adc_value = app_adc_cb();
		printk("Sending value = %d", ++count);
		my_lbs_send_sensor_notify(adc_value);
		k_sleep(K_MSEC(500));
	}
}

static void on_connected(struct bt_conn *conn, uint8_t err)
{
	char addr[BT_ADDR_LE_STR_LEN];
	struct bt_conn_info info;
	if (err)
	{
		printk("Connection failed (err %u)\n", err);
		return;
	}
	is_ble_connected = true;
	bt_addr_le_to_str(bt_conn_get_dst(conn), addr, sizeof(addr));
	LOG_INF("Connected to: %s", addr);

	err = bt_conn_get_info(conn, &info);
	if (err)
	{
		printk("Failed to get connection info (err %d)\n", err);
	}
	else
	{
		const struct bt_conn_le_phy_info *phy_info;
		phy_info = info.le.phy;

		printk("Connected: %s, tx_phy %u, rx_phy %u\n",
			   addr, phy_info->tx_phy, phy_info->rx_phy);
	}

}

static void on_disconnected(struct bt_conn *conn, uint8_t reason)
{
	char addr[BT_ADDR_LE_STR_LEN];
	is_ble_connected = false;
	bt_addr_le_to_str(bt_conn_get_dst(conn), addr, sizeof(addr));

	LOG_INF("Disconnected: %s (reason %u)", addr, reason);
}

static void le_phy_updated(struct bt_conn *conn,
						   struct bt_conn_le_phy_info *param)
{
	LOG_INF("LE PHY updated: TX PHY %s, RX PHY %s\n",
			phy2str(param->tx_phy), phy2str(param->rx_phy));
}



/*-----------------BLE callbacks-----------------*/

struct bt_conn_cb connection_callbacks = {
	.connected = on_connected,
	.disconnected = on_disconnected,
	.le_phy_updated = le_phy_updated,
};

void start_advertising(void)
{
	

	size_t count = 1; // We want to retrieve one identity
	bt_addr_le_t addrs[1];

	bt_id_get(addrs, &count);

	if (count > 0)
	{
		// Print the Bluetooth identity address
		printk("Bluetooth Identity: %02X:%02X:%02X:%02X:%02X:%02X\n",
			   addrs[0].a.val[5], addrs[0].a.val[4], addrs[0].a.val[3],
			   addrs[0].a.val[2], addrs[0].a.val[1], addrs[0].a.val[0]);
	}
	else
	{
		printk("No Bluetooth identities found\n");
	}

	LOG_INF("Bluetooth initialized\n");

	if (IS_ENABLED(CONFIG_SETTINGS))
	{
		settings_load();
	}

	err = bt_le_adv_start(adv_param, ad, ARRAY_SIZE(ad),
						  sd, ARRAY_SIZE(sd));
	if (err)
	{
		printk("Failed to start advertising (err %d)\n", err);
	}
	else
	{
		printk("Advertising started\n\n");
	}
}

void peripheralInit()
{
	k_msleep(1000);
	if (!device_is_ready(adc_dev))
	{
		printk("adc_dev not ready\n");
		return;
	}

	err = adc_channel_setup(adc_dev, &chl1_cfg);
	if (err != 0)
	{
		printk("ADC channel_1 setup failed with error %d.\n", err);
		return;
	}
}

void callbacks()
{
	/*-----------------BLE callbacks----------------*/

	bt_conn_cb_register(&connection_callbacks);
}

int main(void)
{
	LOG_INF("Peripheral Node Starting.\n\r");
	peripheralInit();
	callbacks();
	err = bt_enable(NULL);
	if (err)
	{
		LOG_ERR("Bluetooth init failed (err %d)\n", err);
		return;
	}
	printk("Bluetooth initialized\n");

	//  Manually register the GATT table
    err = bt_gatt_service_register(&my_lbs_svc);
    if (err) {
        printk("Failed to register GATT service (err %d)\n", err);
        return;
    }

    printk("GATT service registered\n");

/* ************legacy advertisment with no LE encoded*********************************/
	start_advertising();
/* ************simple advertisment with no LE encoded*********************************/


	

	int count = 0;
	while (1)
	{
		if (is_ble_connected)
		{
			uint32_t adc_value = app_adc_cb();
			int n = my_lbs_send_sensor_notify(adc_value);
			if (!n)
			{
				printk("Sending value = %d", ++count);
			}
			k_sleep(K_MSEC(2000)); // stay in IDLE Thread for 2 seconds
		}
		k_msleep(100);
	}
}
