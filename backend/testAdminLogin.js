const testLogin = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@ddcosmetics.com',
        password: 'adminpassword123'
      })
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log('Login successful:', data);
    } else {
      console.log('Login failed:', data);
    }
  } catch (error) {
    console.error('Network error:', error.message);
  }
};

testLogin();