import { dnsGnConfig } from './dns-gn';
import { dnsGiConfig } from './dns-gi';
import { adcConfig } from './adc';
import { uscStpConfig } from './usc-stp';
import { udmHssConfig } from './udm-hss';
import { mssConfig } from './mss';
import { gssConfig } from '../configs/gss';
import { mgwConfig } from './mgw';
import { tmgwConfig } from './tmgw';
import { imsConfig } from './ims';

export const ELEMENTS_CONFIG = {
  'DNS Gn': dnsGnConfig,
  'DNS Gi': dnsGiConfig,
  'ADC': adcConfig,
  'USC/STP': uscStpConfig, 'USC-STP': uscStpConfig,
  'UDM/HSS': udmHssConfig,'UDM-HSS': udmHssConfig,
  'MSS': mssConfig,
  'MGW': mgwConfig,
  'TMGW': tmgwConfig,
  'GSS': gssConfig,
  'IMS': imsConfig
};