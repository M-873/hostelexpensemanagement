// Test real-time expense creation with proper authentication
import { io } from 'socket.io-client';

const testRealTimeExpense = async () => {
  try {
    console.log('🧪 Testing real-time expense creation...');
    
    // First, get a valid JWT token
    console.log('🔑 Getting JWT token...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@hostel.com',
        password: 'password',
        role: 'admin'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Got JWT token:', token.substring(0, 20) + '...');

    // Connect to Socket.IO with the token
    const socket = io('http://localhost:3001', {
      auth: {
        token: token
      }
    });

    socket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server');
      socket.emit('join-hostel', '550e8400-e29b-41d4-a716-446655440000');
      console.log('✅ Joined hostel room: 550e8400-e29b-41d4-a716-446655440000');
      
      // Create test expense after joining room
      setTimeout(createTestExpense, 1000);
    });

    socket.on('expense-created', (data) => {
      console.log('🎉 SUCCESS! Real-time event received - Expense created:', data);
      console.log('✅ The Summary section should now update automatically!');
      socket.disconnect();
      process.exit(0);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error.message);
      process.exit(1);
    });

    async function createTestExpense() {
      console.log('🧪 Creating test expense...');
      try {
        const response = await fetch('http://localhost:3001/api/expenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            amount: 50.00,
            category: 'Food',
            description: 'Test expense for real-time validation',
            date: new Date().toISOString(),
            hostelId: '550e8400-e29b-41d4-a716-446655440000'
          })
        });

        if (!response.ok) {
          throw new Error(`Expense creation failed: ${response.status}`);
        }

        const expenseData = await response.json();
        console.log('✅ Test expense created:', expenseData);
        console.log('⏳ Waiting for real-time event...');
        
        // Wait for the event or timeout
        setTimeout(() => {
          console.log('⚠️  No real-time event received within 5 seconds');
          socket.disconnect();
          process.exit(1);
        }, 5000);

      } catch (error) {
        console.error('❌ Failed to create test expense:', error.message);
        socket.disconnect();
        process.exit(1);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
};

// Run test
testRealTimeExpense();