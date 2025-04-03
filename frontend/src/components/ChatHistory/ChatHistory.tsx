import React, { useState } from "react";
import Message from "../Message/Message";

import './ChatHistory.css';
import { RoomData } from "../LoginWindow/LoginWindow";

const ChatHistory: React.FC<{roomData: RoomData, socket: WebSocket}> = ({ socket }) => {
  const [messages, setMessages] = useState<string[]>([])
  
  socket.onmessage = (event) => {
    const newMessage = JSON.parse(event.data);
    setMessages((prevMessages) => [...prevMessages, newMessage.msg]);
  };

  return(
    <div className="chatHistory" id="chatHistory">
      <div className="innerContainer">
        {messages.map((message, index) => (
          <Message message={message} key={index}/>
        ))}
      </div>
    </div>
  )
};

export default ChatHistory;
