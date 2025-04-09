import React, { useRef, useState } from "react";
import './login.css'

let socket: WebSocket;
const url = `ws://127.0.0.1:8080/join?roomname=`

function connectSocket(roomname: string, setParentSocket: (value: WebSocket) => void) {
  socket = new WebSocket(url + roomname)
  setParentSocket(socket)

  socket.onclose = function() {
    setTimeout(connectSocket, 5000)
  }
}

export class RoomData {
    public roomname: string = ""
    public username: string = ""
    public type: number = -1
    public roomState: boolean = false
    public finalKey: number = 0
}

const LoginScreen: React.FC<{setRoomData: (value: RoomData) => void, setParentSocket: (value: WebSocket) => void}> = ({ setRoomData, setParentSocket }) => {
  
  const [loginStatus, setLoginStatus] = useState(0);
  const usernameRef = useRef<HTMLInputElement>(null);
  const roomnameRef = useRef<HTMLInputElement>(null);
  
  const setName = async () => {
    const name = usernameRef.current!.value
    const roomname = roomnameRef.current!.value

    connectSocket(roomname!, setParentSocket);
    console.log(name);
    console.log(roomname);
    console.log(socket);
    
    let mysocket = socket
    
    const responsePromise = new Promise((resolve, reject) => {
      mysocket.onmessage = (event) => {
        const response = JSON.parse(event.data);
        console.log(response)
        if(response) {
          if(response.code === 200 || response.code === 201) {
            let roomData = new RoomData();
            if(response.code === 200) {
                roomData.type = 1
            } else {
                roomData.type = 0
            }
            roomData.roomname = roomname!
            roomData.username = name!
            console.log("Here")
            setRoomData(roomData);
            setLoginStatus(1)
          } else {
            setLoginStatus(2)
            console.log(loginStatus)
          }
          resolve(response.payload);
        } else {
          reject(response.error);
        }
      }
    });

    try {
      const response = await responsePromise;
      return response;
    } catch(error) {
      throw error;
    }

  }  

  return (
    <div id="loginScreen">
      <div className="loginBox">
        {loginStatus === 2 ? 
          (<p className="loginStatus">Room Locked</p>) : 
          (<div></div>)}
        <div className="inputContainer">
          <div className="usernameBox">
            <input id="usernameInput" ref={usernameRef} placeholder="Username"/>
          </div>
          <div className="roomBox">
            <input id="roomInput" ref={roomnameRef} placeholder="Room Name"/>
          </div>
        </div>
        <button className="loginButton" onClick={setName}
        >Login</button>
      </div>
    </div>
  )
}

export default LoginScreen;
