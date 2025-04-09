import React, { useEffect, useRef } from "react";
import './MessageBox.css';
import { RoomData } from "../LoginWindow/LoginWindow";

const msg_url = "http://127.0.0.1:8080/message";

const MessageBox: React.FC<{roomData: RoomData, socket: WebSocket, finalKey: number}> = ( {roomData, socket} ) => {
  
    const msgRef = useRef<HTMLInputElement>(null);

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

    function encrypt(msg: string) {
        return msg;
    }

    function sendMsg() {
        const msg = msgRef.current?.value;
        if (msg !== "") {
            console.log("sending")
            let data = {
                "roomname": roomData.roomname,
                "username": roomData.username,
                "msg": encrypt(msg!)
            }
            fetch(msg_url,
            {
                 method: 'POST',
                 headers: {
                     'Content-Type': 'application/json'
                 },
                 body: JSON.stringify(data)
            });

            msgRef.current!.value = ""
        }
    }

  return(
    <div className="messageBox">
      <input type="text" id="textInput" ref={msgRef} className="textInput" placeholder="Message Room"></input>
      <button className="sendButton" onClick={sendMsg}>Send</button>
    </div>
  )
};

export default MessageBox;
