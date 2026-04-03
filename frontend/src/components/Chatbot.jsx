import React, { useState } from "react";
import axios from "axios";

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    { bot: "Hi 👋 How can I assist you today?" }
  ]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;

    setChat((prev) => [...prev, { user: userMessage }]);
    setMessage("");

    try {
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

      const res = await axios.post(`${backendUrl}/api/chat`, {
        message: userMessage,
      });

      setChat((prev) => [...prev, { bot: res.data.reply }]);
    } catch (error) {
      setChat((prev) => [
        ...prev,
        { bot: "Server error. Please try again later." },
      ]);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "#000",
          color: "#fff",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          zIndex: 9999,
          fontSize: "22px"
        }}
      >
        💬
      </div>

      {/* Chat Window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "320px",
            height: "420px",
            background: "#fff",
            borderRadius: "15px",
            boxShadow: "0 0 20px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 9999,
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "#000",
              color: "#fff",
              padding: "10px",
              textAlign: "center",
            }}
          >
            AI Assistant
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: "10px",
              overflowY: "auto",
              fontSize: "14px",
            }}
          >
            {chat.map((c, index) => (
              <div key={index} style={{ marginBottom: "8px" }}>
                {c.user && (
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        background: "#eee",
                        padding: "6px 10px",
                        borderRadius: "10px",
                        display: "inline-block",
                      }}
                    >
                      {c.user}
                    </span>
                  </div>
                )}
                {c.bot && (
                  <div style={{ textAlign: "left" }}>
                    <span
                      style={{
                        background: "#000",
                        color: "#fff",
                        padding: "6px 10px",
                        borderRadius: "10px",
                        display: "inline-block",
                      }}
                    >
                      {c.bot}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ display: "flex", padding: "10px" }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                marginLeft: "8px",
                padding: "8px 12px",
                background: "#000",
                color: "#fff",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;