const redButton = document.getElementById('red-btn');
const blueButton = document.getElementById('blue-btn');
const timeDisplay = document.getElementById('time-display');
fetch('https://ipapi.co/json/')
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    console.log(data);
  });
let redClicks = 0;
let blueClicks = 0;
let clickLimit = 10;
let resetTime = 60 * 1000; // 1 minute in milliseconds

// Display current time
function updateTime() {
    const now = new Date();
    timeDisplay.textContent = `Current Time: ${now.toLocaleTimeString()}`;
}
setInterval(updateTime, 1000);

// Reset click counts after 1 minute
function resetClickCounts() {
    redClicks = 0;
    blueClicks = 0;
}
setInterval(resetClickCounts, resetTime);

// Handle red button clicks
redButton.addEventListener('click', () => {
    redClicks++;
    if (redClicks > clickLimit) {
        alert('Red button limit exceeded! Please wait 1 minute.');
    }
});

// Handle blue button clicks
blueButton.addEventListener('click', () => {
    blueClicks++;
    if (blueClicks > clickLimit) {
        alert('Blue button limit exceeded! Please wait 1 minute.');
    }
});
