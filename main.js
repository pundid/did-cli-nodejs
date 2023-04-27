import dotenv from 'dotenv';
import client from './src/client.js';

dotenv.config();

client().then().catch(console.error);
