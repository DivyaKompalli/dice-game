const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
let players = {
  player1: { balance: 100 },
};
const rollDice = () => {
  return Math.floor(Math.random() * 100) + 1;
};

app.post("/roll-dice", (req, res) => {
  const { playerId, betAmount, multiplier, winChance } = req.body;

  if (!playerId || !betAmount || betAmount <= 0 || !multiplier || !winChance) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const player = players[playerId];
  if (!player || player.balance < betAmount) {
    return res.status(400).json({ error: "Insufficient balance" });
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
