import React, { useState, useEffect } from "react";
import "./App.css";

const DiceGame = () => {
  const [betAmount, setBetAmount] = useState(0);
  const [balance, setBalance] = useState(1000);
  const [lastRoll, setLastRoll] = useState(null);
  const [resultMessage, setResultMessage] = useState("");

  // Load balance from localStorage when the component mounts
  useEffect(() => {
    const storedBalance = localStorage.getItem("playerBalance");
    if (storedBalance) {
      setBalance(parseFloat(storedBalance));
    }
  }, []);

  // Save balance to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("playerBalance", balance);
  }, [balance]);

  const rollDice = () => {
    const roll = Math.floor(Math.random() * 6) + 1; // Roll a dice (1-6)
    setLastRoll(roll);

    if (roll > 3) {
      // You win if you roll more than 3
      const winAmount = betAmount * 2; // Simple win calculation
      setBalance(balance + winAmount);
      setResultMessage(`You rolled a ${roll}. You win $${winAmount}!`);
    } else {
      setBalance(balance - betAmount);
      setResultMessage(`You rolled a ${roll}. You lose.`);
    }
  };

  return (
    <div className="App">
      <h1>Provably Fair Dice Game</h1>
      <p>Balance: ${balance}</p>
      <div className="input-container">
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(Number(e.target.value))}
          placeholder="Enter your bet"
          min="0"
          style={{ width: "150px" }}
        />
        <button onClick={rollDice} style={{ marginTop: "10px" }}>
          Roll Dice
        </button>
      </div>
      {lastRoll !== null && <p>You rolled a {lastRoll}.</p>}
      <p>{resultMessage}</p>
    </div>
  );
};

export default DiceGame;
