import { io } from 'socket.io-client';

// Test Socket.IO connection and real-time updates
const token = 'test-token'; // We'll use a mock token for testing
const hostelId = '1';

console.log('Testing real-time functionality...');

const socket = io('http://localhost:3001', {
  auth: {
    token: token,
  },
});

socket.on('connect', () => {
  console.log('✅ Connected to Socket.IO server');
  console.log('Socket ID:', socket.id);
  
  // Join hostel room
  socket.emit('join-hostel', hostelId);
  console.log(`✅ Joined hostel room: ${hostelId}`);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from Socket.IO server');
});

// Listen for all expense and deposit events
socket.on('expense-created', (data) => {
  console.log('📊 Expense created:', data);
});

socket.on('deposit-created', (data) => {
  console.log('💰 Deposit created:', data);
});

socket.on('expense-updated', (data) => {
  console.log('📊 Expense updated:', data);
});

socket.on('deposit-updated', (data) => {
  console.log('💰 Deposit updated:', data);
});

socket.on('expense-deleted', (data) => {
  console.log('📊 Expense deleted:', data);
});

socket.on('deposit-deleted', (data) => {
  console.log('💰 Deposit deleted:', data);
});

// Test connection after 2 seconds
setTimeout(() => {
  console.log('\n🔄 Testing event listeners...');
  console.log('Waiting for real-time events...');
  console.log('Try creating/updating expenses or deposits to see real-time updates!');
}, 2000);

// Keep the script running
setInterval(() => {
  // Keep connection alive
}, 30000);

console.log('🚀 Real-time test client is running...');
console.log('Create or update transactions to see real-time events!');