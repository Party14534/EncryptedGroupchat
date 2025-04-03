import React from "react";

import './Message.css';

const Message: React.FC<{message: string}> = ( {message} ) => {
  return (
    <div className="message">
      <p className="text">{message}</p>
    </div>
  )
};

export default Message;
