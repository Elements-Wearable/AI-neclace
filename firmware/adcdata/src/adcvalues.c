
#include "adcvalues.h"



/////////////ADC Callback Function///////////

int app_adc_cb (void)
{
    int err;
	int adc_values[NUM_ADC_SAMPLES];
    int total_adc_value = 0;
    uint32_t average_adc_value = 0;
    
	for (int i = 0; i < NUM_ADC_SAMPLES; i++) {
            
        err = adc_read(adc_dev, &sequence);
        if (err != 0) {
            printk("ADC reading failed with error %d.\n", err);
            return NULL;
        }
		adc_values[i] = sample_buffer[0];
        total_adc_value += adc_values[i];

        //printk("\nADC_value_%d: %d\n", i + 1, adc_values[i]);
               
	}

	average_adc_value = total_adc_value / NUM_ADC_SAMPLES;

    // ADC_values = (char *)malloc(10 * sizeof(char)); // Allocate memory for the string
    // snprintf(ADC_values, 11, "%d", average_adc_value);

    //printk("\nAverage ADC value: %d\n", average_adc_value);
    
    return average_adc_value;
}
