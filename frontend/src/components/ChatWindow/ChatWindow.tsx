import React, { RefObject } from 'react';
import ChatHistory from '../ChatHistory/ChatHistory';
import MessageBox from '../MessageBox/MessageBox';

import './ChatWindow.css';
import { RoomData } from '../LoginWindow/LoginWindow';


const ChatWindow: React.FC<{roomData: RoomData, socket: WebSocket, finalKey: number, messages: RefObject<any[]>}> = ({ roomData, socket, finalKey, messages }) => {
  
  return(
    <div className='chatWindow'>
      <div className='chatBox'>
        <ChatHistory socket={socket} roomData={roomData} finalKey={finalKey} messages={messages}/>
        <MessageBox socket={socket} roomData={roomData} finalKey={finalKey}/>
      </div>
    </div>
  ) 
};

export default ChatWindow;

