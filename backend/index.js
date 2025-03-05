const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const cors = require("cors");
const { ethers } = require("ethers");
const helmet = require("helmet");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(helmet()); // Add security headers

let playerBalance = 1000;

if (typeof window !== "undefined") {
  const storedBalance = localStorage.getItem("playerBalance");
  if (storedBalance) {
    playerBalance = parseFloat(storedBalance);
  }
}

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "../public")));

app.post("/roll-dice", (req, res) => {
  const { bet } = req.body;

  if (bet <= 0 || bet > playerBalance) {
    return res.status(400).json({ error: "Invalid bet amount" });
  }

  const randomNumber = Math.floor(Math.random() * 6) + 1;
  const hash = crypto
    .createHash("sha256")
    .update(String(randomNumber))
    .digest("hex");

  let winnings = 0;
  if (randomNumber >= 4) {
    winnings = bet * 2; // 2x payout
    playerBalance += winnings - bet;
  } else {
    playerBalance -= bet; // lose bet
  }

  // Store player balance in local storage
  if (typeof window !== "undefined") {
    localStorage.setItem("playerBalance", playerBalance);
  }

  // Include the hash in the response for verification
  res.json({ result: randomNumber, winnings, hash });
});

// Simulate a crypto wallet balance
app.post("/get-balance", async (req, res) => {
  const { walletAddress } = req.body;

  if (!ethers.utils.isAddress(walletAddress)) {
    return res.status(400).json({ error: "Invalid wallet address" });
  }

  const provider = ethers.getDefaultProvider(); // Connects to default Ethereum provider
  try {
    const balance = await provider.getBalance(walletAddress);
    res.json({ balance: ethers.utils.formatEther(balance) });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
