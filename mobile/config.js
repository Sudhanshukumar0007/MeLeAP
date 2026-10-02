// Use your laptop's local IP address for physical devices.
// Do not use 'localhost' or '127.0.0.1' because on a physical phone,
// 'localhost' points to the phone itself, not your laptop.

import { Platform } from 'react-native';

// For local testing on a physical device, replace this IP with your laptop's actual IP address on your Wi-Fi network.
// You can find this by running `ipconfig` (Windows) or `ifconfig` (Mac/Linux) and looking for your IPv4 Address.
// Example: 'http://192.168.1.100:5000'
const LOCAL_IP = '192.168.1.15';

export const API_URL = `http://${LOCAL_IP}:5000`;
