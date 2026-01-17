// Simple test to verify real-time expense creation
import { io } from 'socket.io-client';

const testRealTime = async () => {
  try {
    console.log('🧪 Testing real-time expense creation...');
    
    // Connect to Socket.IO
    const socket = io('http://localhost:3001', {
      auth: {
        token: 'test-token'
      }
    });

    socket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server');
      socket.emit('join-hostel', '550e8400-e29b-41d4-a716-446655440000');
      console.log('✅ Joined hostel room');
      
      // Wait for events
      console.log('⏳ Waiting for real-time events...');
    });

    socket.on('expense-created', (data) => {
      console.log('🎉 SUCCESS! Real-time event received - Expense created:', data);
      console.log('✅ The Summary section should now update automatically!');
      socket.disconnect();
      process.exit(0);
    });

    socket.on('deposit-created', (data) => {
      console.log('🎉 SUCCESS! Real-time event received - Deposit created:', data);
      console.log('✅ The Summary section should now update automatically!');
      socket.disconnect();
      process.exit(0);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error.message);
      process.exit(1);
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      console.log('⚠️  No real-time events received within 10 seconds');
      console.log('💡 Try creating an expense or deposit manually to test real-time updates');
      socket.disconnect();
      process.exit(0);
    }, 10000);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
};

// Run test
testRealTime();