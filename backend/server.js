const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const cors = require("cors"); // Add CORS middleware
const path = require("path"); // For serving static files

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable CORS
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per windowMs
});
app.use(limiter);

let players = {
  player1: { balance: 100 },
};

const rollDice = () => {
  return Math.floor(Math.random() * 100) + 1;
};

app.post("/roll-dice", (req, res) => {
  const { playerId, betAmount, multiplier, winChance } = req.body;

  // Input validation
  if (!playerId || !betAmount || betAmount <= 0 || !multiplier || !winChance) {
    return res
      .status(400)
      .json({ error: "Invalid input: Missing required fields." });
  }

  if (multiplier <= 1) {
    return res
      .status(400)
      .json({ error: "Multiplier must be greater than 1." });
  }

  if (winChance < 0 || winChance > 100) {
    return res
      .status(400)
      .json({ error: "Win chance must be between 0 and 100." });
  }

  const player = players[playerId];
  if (!player) {
    return res.status(404).json({ error: "Player not found." });
  }

  if (player.balance < betAmount) {
    return res.status(400).json({ error: "Insufficient balance." });
  }

  player.balance -= betAmount;

  const roll = rollDice();
  const win = roll <= winChance;
  const winnings = win ? betAmount * multiplier : 0;

  player.balance += winnings;

  // Generate hash for fairness verification
  const hash = crypto
    .createHash("sha256")
    .update(`${roll}${betAmount}${multiplier}${winChance}`)
    .digest("hex");

  res.json({
    roll,
    winnings,
    newBalance: player.balance,
    deductedAmount: betAmount,
    hash,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
