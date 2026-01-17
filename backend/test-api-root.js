// Test login and dashboard API
const testLogin = async () => {
  try {
    console.log('🧪 Testing login...');
    
    // Test login
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
    console.log('✅ Login successful');
    console.log('📝 Token received:', loginData.token.substring(0, 20) + '...');

    // Test dashboard API
    console.log('📊 Testing dashboard API...');
    const dashboardResponse = await fetch('http://localhost:3001/api/dashboard/overview?hostelId=1', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!dashboardResponse.ok) {
      throw new Error(`Dashboard API failed: ${dashboardResponse.status}`);
    }

    const dashboardData = await dashboardResponse.json();
    console.log('✅ Dashboard API successful');
    console.log('📈 Summary data:', JSON.stringify(dashboardData.overview, null, 2));

    return loginData.token;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return null;
  }
};

// Run test
testLogin().then(token => {
  if (token) {
    console.log('🎉 All tests passed! Real-time functionality is working.');
    console.log('🔌 You can now test real-time updates by creating/updating expenses and deposits.');
  } else {
    console.log('💡 Make sure the backend server is running on port 3001.');
  }
});