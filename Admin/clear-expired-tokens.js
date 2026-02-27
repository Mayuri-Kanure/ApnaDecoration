// Clear expired tokens and restart admin frontend
const fs = require('fs');
const path = require('path');

console.log('🧹 Clearing expired authentication tokens...');

// Create a simple HTML file to clear localStorage and redirect
const clearAuthHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Clearing Authentication</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0; 
            background: #f5f5f5;
        }
        .container { 
            text-align: center; 
            padding: 2rem; 
            background: white; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .spinner { 
            border: 4px solid #f3f3f3; 
            border-top: 4px solid #007bff; 
            border-radius: 50%; 
            width: 40px; 
            height: 40px; 
            animation: spin 1s linear infinite; 
            margin: 0 auto 1rem;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="container">
        <div class="spinner"></div>
        <h2>Clearing expired authentication...</h2>
        <p>Please wait while we reset your session.</p>
    </div>
    <script>
        // Clear all auth-related data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.clear();
        
        // Clear any cookies related to auth
        document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
    </script>
</body>
</html>
`;

// Write the clear auth page
const clearAuthPath = path.join(__dirname, 'clear-auth.html');
fs.writeFileSync(clearAuthPath, clearAuthHTML);

console.log('✅ Created clear-auth.html');
console.log('');
console.log('🔧 To fix the JWT expiration issue:');
console.log('');
console.log('1. Stop the admin frontend server (Ctrl+C)');
console.log('2. Open your browser and navigate to:');
console.log(`   file:///${clearAuthPath.replace(/\\/g, '/')}`);
console.log('3. Wait for the redirect to complete');
console.log('4. Restart the admin frontend: npm start');
console.log('5. Login with fresh credentials');
console.log('');
console.log('🔐 The fixes applied:');
console.log('- Frontend now handles 401 errors by clearing expired tokens');
console.log('- Backend provides better error messages for expired tokens');
console.log('- Automatic redirect to login on authentication failure');
console.log('');
console.log('🚀 This will prevent the repeated JWT expiration errors.');
