import React from "react";

import './ChatScreen.css'
import { RoomData } from "../LoginWindow/LoginWindow";
import ChatWindow from "../ChatWindow/ChatWindow";
import WaitingRoom from "../WaitingRoom/WaitingRoom";

const ChatScreen: React.FC<{roomData: RoomData, socket: WebSocket}> = ({ roomData, socket }) => {
  return(
    <div className="chatScreen">
        <WaitingRoom roomData={roomData} socket={socket}/>
    </div>
  )
}

export default ChatScreen;
