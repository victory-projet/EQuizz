// Simple script to test authentication
// Run this in browser console on the admin app

console.log('🔍 Testing Authentication...');

// Check localStorage
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');

console.log('Token exists:', !!token);
console.log('User exists:', !!user);

if (token) {
  console.log('Token preview:', token.substring(0, 50) + '...');
  
  // Try to decode JWT payload (basic check)
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log('Token payload:', payload);
      
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp) {
        console.log('Token expires at:', new Date(payload.exp * 1000));
        console.log('Token is expired:', payload.exp < now);
      }
    }
  } catch (e) {
    console.error('Error decoding token:', e);
  }
}

if (user) {
  try {
    const userData = JSON.parse(user);
    console.log('User data:', userData);
  } catch (e) {
    console.error('Error parsing user data:', e);
  }
}

// Test API call
console.log('🌐 Testing API call...');
fetch('https://equizz-backend.onrender.com/api/dashboard/admin?year=2025-2026', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('API Response status:', response.status);
  if (response.status === 401) {
    console.log('❌ Authentication failed - 401 Unauthorized');
  } else if (response.ok) {
    console.log('✅ Authentication successful');
    return response.json();
  } else {
    console.log('⚠️ Other error:', response.status);
  }
})
.then(data => {
  if (data) {
    console.log('API Response data:', data);
  }
})
.catch(error => {
  console.error('❌ API call failed:', error);
});

console.log('🔍 Authentication test complete. Check the logs above.');