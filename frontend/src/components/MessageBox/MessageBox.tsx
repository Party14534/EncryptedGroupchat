import React, { useEffect } from "react";
import './MessageBox.css';
import { RoomData } from "../LoginWindow/LoginWindow";

const MessageBox: React.FC<{roomData: RoomData, socket: WebSocket}> = ( {roomData, socket} ) => {
  
  useEffect(() => {
    const textInput = document.getElementById('textInput')

    if(textInput) {
      textInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          sendMsg()
        }
      })
    }
  })

  function sendMsg() {
    console.log(roomData.username)
    const msgInput = document.getElementById("textInput");
    const msg = msgInput?.nodeValue!.trim()
    if (msg !== "") {
      socket.send(JSON.stringify({username: roomData.username, msg: msg, roomname: roomData.roomname}));
      msgInput!.nodeValue = ""
    }
  }

  return(
    <div className="messageBox">
      <input type="text" id="textInput" className="textInput" placeholder="Message Room"></input>
      <button className="sendButton" onClick={sendMsg}>Send</button>
    </div>
  )
};

export default MessageBox;
