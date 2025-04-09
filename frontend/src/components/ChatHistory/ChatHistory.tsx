import React, { RefObject, useState } from "react";
import Message from "../Message/Message";

import './ChatHistory.css';
import { RoomData } from "../LoginWindow/LoginWindow";

const ChatHistory: React.FC<{roomData: RoomData, socket: WebSocket, finalKey: number}> = ({ socket, finalKey }) => {
    const [messages, setMessages] = useState<any[]>([])
    function decrypt(msg: string) {
        return msg;
    }

    socket.onmessage = (event) => {
        console.log("got one")
        const newMessage = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, newMessage]); 
    }

  return(
    <div className="chatHistory" id="chatHistory">
      <div className="innerContainer">
        {messages.map((message, index) => (
          <Message message={message.msg} key={index}/>
        ))}
      </div>
    </div>
  )
};

export default ChatHistory;
