import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io.connect("http://localhost:3001");

const ChatComponent = () => {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  
  const bottomRef = useRef(null);

  const joinRoom = async () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      
      // Fetch chat history from the API
      try {
          const response = await fetch(`http://localhost:3001/api/messages/${room}`);
          const history = await response.json();
          setMessageList(history);
      } catch (error) {
          console.error("Error fetching chat history:", error);
      }
      
      setShowChat(true);
    }
  };

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        timestamp: new Date().toISOString()
      };

      await socket.emit("send_message", messageData);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    const handleReceiveMessage = (data) => {
      setMessageList((list) => [...list, data]);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messageList]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
      {!showChat ? (
        <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center w-80">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Join A Chat</h3>
          <input
            type="text"
            placeholder="John..."
            className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(event) => {
              setUsername(event.target.value);
            }}
          />
          <input
            type="text"
            placeholder="Room ID..."
            className="w-full mb-6 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(event) => {
              setRoom(event.target.value);
            }}
          />
          <button 
            onClick={joinRoom}
            className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-md hover:bg-indigo-700 transition duration-300"
          >
            Join A Room
          </button>
        </div>
      ) : (
        <div className="bg-white flex flex-col w-full max-w-md h-[500px] border border-gray-300 rounded-lg shadow-xl overflow-hidden">
          <div className="bg-indigo-600 text-white p-4 font-bold flex justify-between items-center">
            <p>Live Chat - Room: {room}</p>
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span className="text-sm font-normal">Active</span>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messageList.map((messageContent, idx) => {
              const isMe = username === messageContent.author;
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-end gap-1">
                      <div 
                        className={`px-4 py-2 max-w-[250px] rounded-2xl break-words
                          ${isMe 
                            ? "bg-indigo-600 text-white rounded-br-none" 
                            : "bg-gray-200 text-gray-800 rounded-bl-none"
                          }`
                        }
                      >
                        <p>{messageContent.message}</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-slate-500">{messageContent.author}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(messageContent.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 bg-white border-t border-gray-200 flex gap-2">
            <input
              type="text"
              value={currentMessage}
              placeholder="Hey..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={(event) => {
                setCurrentMessage(event.target.value);
              }}
              onKeyPress={(event) => {
                event.key === "Enter" && sendMessage();
              }}
            />
            <button 
              onClick={sendMessage}
              className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-indigo-700 transition duration-300"
            >
              &#9658;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatComponent;
