import { defineConfig } from '@playwright/test';
import {existsSync} from 'node:fs';
export default defineConfig({testDir:'./tests/browser',use:{baseURL:'http://127.0.0.1:5173',browserName:'chromium',launchOptions:{...(existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{}),args:['--no-sandbox']}},webServer:[{command:'npm run dev -- --port 5173',url:'http://127.0.0.1:5173',reuseExistingServer:true},{command:'npm run build && npm run preview -- --port 4173',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI}],reporter:'list'});
