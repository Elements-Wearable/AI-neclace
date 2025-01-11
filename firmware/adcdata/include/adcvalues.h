
#ifndef ADCVALUES_H_
#define ADCVALUES_H_

#include <zephyr/drivers/adc.h>
#include <zephyr/drivers/gpio.h>
#include <zephyr/sys/printk.h>
#include <stdlib.h>
#include <stdio.h>

/* For saving value in flash */
#include <zephyr/settings/settings.h>
#define ADC_NODE DT_NODELABEL(adc)
const static struct device *const adc_dev = DEVICE_DT_GET(ADC_NODE);


extern const struct device *const adc_dev;

#define NUM_ADC_VALUES 2
#define NUM_ADC_SAMPLES 10

#define ADC_RESOLUTION	12
#define ADC_CHANNEL_1 	0
#define ADC_PORT_1 		SAADC_CH_PSELP_PSELP_AnalogInput2	//AIN2 (P0.04)
#define ADC_REFERENCE	ADC_REF_INTERNAL	//0.6V
#define ADC_GAIN		ADC_GAIN_1_6

// extern int err;
// extern int16_t sample_buffer[1];
// extern struct adc_sequence sequence;
// extern struct adc_channel_cfg chl1_cfg;


static int16_t sample_buffer[1];
static struct adc_sequence sequence = {
	.channels = BIT(ADC_CHANNEL_1),
	.buffer = sample_buffer,

	.buffer_size = sizeof(sample_buffer),
	.resolution = ADC_RESOLUTION};

/* Channel_1 */
static struct adc_channel_cfg chl1_cfg = {
	.gain = ADC_GAIN,
	.reference = ADC_REFERENCE,
	.acquisition_time = ADC_ACQ_TIME_DEFAULT,
	.channel_id = ADC_CHANNEL_1,

#ifdef CONFIG_ADC_NRFX_SAADC
	.input_positive = ADC_PORT_1
#endif
};

int app_adc_cb(void);

#endif 