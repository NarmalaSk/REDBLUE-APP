const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");


const app = express();
const port = 3000;

// In-memory store for tracking clicks within a minute
const clickTracker = {
  red: [],
  blue: [],
};

// Fetch IP address dynamically
const fetchIpAddress = async () => {
  try {
    const response = await fetch("http://ip-api.com/json/");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.query; // Extract the IP address
  } catch (error) {
    console.error("Error fetching IP address:", error);
    return "Unknown IP";
  }
};

// PostgreSQL database configuration
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "redblueapp",
  password: "shashi",
  port: 5433, // Default PostgreSQL port
});

app.use(bodyParser.json());
app.use(express.static("public")); // Serve static files like HTML and CSS

// HTML Page
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Color Buttons</title>
        <style>
          button {
            font-size: 20px;
            margin: 10px;
            padding: 10px 20px;
            cursor: pointer;
          }
          .red { background-color: red; color: white; }
          .blue { background-color: blue; color: white; }
          #message { font-size: 18px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>Choose a Color</h1>
        <button class="red" onclick="logColor('red')">Red</button>
        <button class="blue" onclick="logColor('blue')">Blue</button>
        <p id="message"></p>

        <script>
          function logColor(color) {
            fetch('/log-color', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ color }),
            })
            .then(response => response.json())
            .then(data => {
              const messageElement = document.getElementById('message');
              if (data.success) {
                messageElement.textContent = \`\${color} logged successfully.\`;
                messageElement.style.color = color;
              } else {
                messageElement.textContent = data.message || 'Error logging color.';
                messageElement.style.color = 'black';
              }
            })
            .catch(() => {
              document.getElementById('message').textContent = 'Request failed.';
            });
          }
        </script>
      </body>
    </html>
  `);
});

// Log color to the database
app.post("/log-color", async (req, res) => {
  const { color } = req.body;

  if (!["red", "blue"].includes(color)) {
    return res.status(400).json({ success: false, message: "Invalid color." });
  }

  const currentTime = Date.now();
  const oneMinuteAgo = currentTime - 60000; // 60,000 ms = 1 minute

  // Filter out clicks older than a minute for the color
  clickTracker[color] = clickTracker[color].filter((timestamp) => timestamp > oneMinuteAgo);

  if (clickTracker[color].length >= 10) {
    console.log(`Click limit exceeded for ${color}.`);
    return res
      .status(429)
      .json({ success: false, message: `Clicks expired for ${color}, try after 1 minute.` });
  }

  try {
    const ipAddress = await fetchIpAddress(); // Fetch the IP address dynamically

    // Increment the click count in memory
    clickTracker[color].push(currentTime);

    // Insert into the database
    await pool.query(
      `INSERT INTO click_data (ip_address, click_count, color, timestamp) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
      [ipAddress, clickTracker[color].length, color]
    );

    console.log(`Logged: Color=${color}, IP=${ipAddress}, Click Count=${clickTracker[color].length}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Error logging color:", err);
    res.status(500).json({ success: false });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
