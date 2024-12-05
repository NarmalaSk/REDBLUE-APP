const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files if needed (e.g., CSS, images)
app.use(express.static(path.join(__dirname, 'Frontend')));

// Route to render the HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Frontend', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
