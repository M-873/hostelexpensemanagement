// Test creating an expense to trigger real-time events
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: {
    token: 'test-token'
  }
});

socket.on('connect', () => {
  console.log('✅ Connected to Socket.IO server');
  socket.emit('join-hostel', '1');
  console.log('✅ Joined hostel room: 1');
  
  // Create a test expense after connection
  setTimeout(createTestExpense, 2000);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from Socket.IO server');
});

// Listen for real-time events
socket.on('expense-created', (data) => {
  console.log('🎉 SUCCESS! Real-time event received - Expense created:', data);
  console.log('✅ The Summary section should now update automatically!');
  process.exit(0);
});

socket.on('deposit-created', (data) => {
  console.log('🎉 SUCCESS! Real-time event received - Deposit created:', data);
  console.log('✅ The Summary section should now update automatically!');
  process.exit(0);
});

async function createTestExpense() {
  try {
    console.log('🧪 Creating test expense...');
    
    const response = await fetch('http://localhost:3001/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        amount: 50.00,
        category: 'Food',
        description: 'Test expense for real-time validation',
        date: new Date().toISOString().split('T')[0],
        hostelId: '1'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Test expense created successfully:', data);
      console.log('⏳ Waiting for real-time event...');
    } else {
      console.log('❌ Failed to create test expense:', response.status);
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ Error creating test expense:', error.message);
    process.exit(1);
  }
}

// Timeout after 10 seconds
setTimeout(() => {
  console.log('❌ Timeout: No real-time event received');
  process.exit(1);
}, 10000);