import { io } from 'socket.io-client';

// חשוב לשנות את הכתובת לכתובת ה-IP הציבורית של שרת ה-EC2
export const socket = io('http://3.123.2.25:3001');