const { exec } = require('child_process');

console.log('Building Tailwind CSS...');

exec('npx tailwindcss -i ./src/App.css -o ./src/App.css --watch', (error, stdout, stderr) => {
  if (error) {
    console.error('Error:', error);
    return;
  }
  if (stderr) {
    console.error('Stderr:', stderr);
  }
  console.log('Tailwind CSS built successfully!');
  console.log('Output:', stdout);
});
