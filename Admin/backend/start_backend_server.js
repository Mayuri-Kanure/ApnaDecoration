const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Backend Server for Live API Testing...');

// Start the backend server
const serverProcess = spawn('node', ['server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

serverProcess.on('close', (code) => {
  console.log(`Backend server process exited with code ${code}`);
});

serverProcess.on('error', (error) => {
  console.error('Failed to start backend server:', error);
});

console.log('📡 Backend server should be running on http://localhost:5000');
console.log('🔑 Use this token in your browser:');
console.log('localStorage.setItem(\'deliveryBoyToken\', \'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZDBkYWFhZWI2YWIyNTE2ZDUyZDMwMCIsImlhdCI6MTc3NTI5ODg4MCwiZXhwIjoxNzc3ODkwODgwfQ.JSwuthpxb3rUCispXLkNySgtVe7d7q4Q15DVSbmIeDw\');');
console.log('🌐 Then update constants.js to point to http://localhost:5000 if testing locally');
