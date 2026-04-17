import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";

// Connect to your Node.js server
const socket = io.connect("http://localhost:3001");

function App() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [room, setRoom] = useState("general");

  useEffect(() => {
    socket.emit("join_room", room);

    // Fetch previous messages from your MySQL backend
    axios.get(`http://localhost:3001/messages/${room}`)
      .then(res => setChatHistory(res.data))
      .catch(err => console.log("No history route found yet."));
  }, [room]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setChatHistory((prev) => [...prev, data]);
    });
    // Clean up the socket listener when component unmounts
    return () => socket.off("receive_message");
  }, []);

  const sendMessage = async () => {
    if (message !== "") {
      const msgData = {
        room,
        author: "Victor",
        message,
        time: new Date().toLocaleTimeString()
      };
      await socket.emit("send_message", msgData);
      setChatHistory((prev) => [...prev, msgData]);
      setMessage("");
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", backgroundColor: "#f4f4f9", minHeight: "100vh" }}>
      <h1 style={{ color: "#333" }}>CODTECH Real-Time Chat (MySQL)</h1>

      <div style={{
        border: "1px solid #ddd",
        borderRadius: "10px",
        height: "400px",
        overflowY: "scroll",
        padding: "20px",
        backgroundColor: "white",
        boxShadow: "0px 4px 10px rgba(0,0,0,0.1)"
      }}>
        {chatHistory.map((m, i) => (
          <div key={i} style={{ marginBottom: "15px" }}>
            <span style={{ fontWeight: "bold", color: "#007bff" }}>{m.author}</span>:
            <span style={{ marginLeft: "10px" }}>{m.message}</span>
            <div style={{ fontSize: "10px", color: "#aaa" }}>{m.time}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          style={{ width: "70%", padding: "12px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "12px 25px",
            marginLeft: "10px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;