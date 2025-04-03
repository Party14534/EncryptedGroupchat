import React from "react";

import './ChatScreen.css'
import { RoomData } from "../LoginWindow/LoginWindow";
import ChatWindow from "../ChatWindow/ChatWindow";
import WaitingRoom from "../WaitingRoom/WaitingRoom";

const ChatScreen: React.FC<{roomData: RoomData, socket: WebSocket}> = ({ roomData, socket }) => {
  return(
    <div className="chatScreen">
      {roomData.roomState ? (
        <ChatWindow roomData={roomData} socket={socket}/>
      ): (
        <WaitingRoom roomData={roomData} socket={socket}/>
      )}
    </div>
  )
}

export default ChatScreen;
