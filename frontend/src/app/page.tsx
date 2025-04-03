"use client"
import ChatScreen from "@/components/ChatScreen/ChatScreen";
import LoginScreen, { RoomData } from "../components/LoginWindow/LoginWindow";
import { useState } from "react";

export default function Home() {
  const [roomData, setRoomData] = useState(new RoomData)
  const [socket, setSocket] = useState<WebSocket>()
  
  function setData(data: RoomData) {      
    setRoomData(data)
    console.log(data)
    console.log("Set")
  }

  function setParentSocket(sock: WebSocket) {
      setSocket(sock)
  }

  return (
    <div className="App">
      {roomData.type !== -1 ? (
        <ChatScreen socket={socket!} roomData={roomData}/>
      ) : (
        <LoginScreen setRoomData={setData} setParentSocket={setParentSocket}/>
      )}
    </div>
  );
}
