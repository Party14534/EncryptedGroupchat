import React from 'react';
import ChatHistory from '../ChatHistory/ChatHistory';
import MessageBox from '../MessageBox/MessageBox';

import './ChatWindow.css';
import { RoomData } from '../LoginWindow/LoginWindow';


const ChatWindow: React.FC<{roomData: RoomData, socket: WebSocket}> = ({ roomData, socket }) => {
  
  return(
    <div className='chatWindow'>
      <div className='chatBox'>
        <ChatHistory socket={socket} roomData={roomData}/>
        <MessageBox socket={socket} roomData={roomData}/>
      </div>
    </div>
  ) 
};

export default ChatWindow;

