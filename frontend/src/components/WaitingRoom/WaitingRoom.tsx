import { useEffect, useRef, useState } from "react";
import { RoomData } from "../LoginWindow/LoginWindow";
import MessageBox from "../MessageBox/MessageBox";
import ChatWindow from "../ChatWindow/ChatWindow";

const start_encryption_url = "http://127.0.0.1:8080/startencryption";
const encryption_url = "http://127.0.0.1:8080/encrypt";

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

const WaitingRoom: React.FC<{roomData: RoomData, socket: WebSocket}> = ( {roomData, socket} ) => {

    const [messages, setMessages] = useState<any[]>([]);
    const [startRoomFlag, setStartRoomFlag] = useState(false);
    const [doneEncrypting, setDoneEncrypting] = useState(false);
    const [finalKey, setFinalKey] = useState(0);
    const messagesRef = useRef(messages);
    const startRoomFlagRef = useRef(startRoomFlag);
    const doneEncryptingRef = useRef(doneEncrypting);
    const finalKeyRef = useRef(finalKey);

    const setStartRoomFlagFunction = () => {
        setStartRoomFlag(true);
    }
    
    let startingRoomFlag = false
    const startRoom = async() => {
        if (startingRoomFlag) { return }
        startingRoomFlag = true

        setMessages([])
        if (roomData.type === 1) {
            let flag = false;
            while (!flag) {
                if (!startRoomFlagRef.current) { 
                    await sleep(50);
                    console.log(startRoomFlag);
                    continue 
                }

                const data = {"roomname": roomData.roomname}
                setMessages([])
                const response = await fetch(start_encryption_url,
                                             {
                    method: 'POST',
                    headers: {
                        'Content-Type': "application/json"
                    },
                    body: JSON.stringify(data)
                });
                
                const responseData = await response.json();               
                if (responseData.code === 200) {
                    flag = true
                    break;
                } else {
                    console.log("unable to make room")
                    setStartRoomFlag(false)
                }
            }
        } 
        while (messagesRef.current.length === 0) { 
            await sleep(1);
        }

        console.log(messagesRef.current)
        // Encryption stuff
        const roomSize = messagesRef.current[0].roomsize;
        const userId = messagesRef.current[0].userid;
        let newMessages = [ ...messagesRef.current.slice(1) ];
        setMessages(newMessages);
        messagesRef.current = newMessages;
        console.log(messagesRef.current);

        const privateKey = getRandomInt(1000);
        const publicKey = getRandomInt(1000);
        console.log(publicKey, privateKey, "\n--------")

        let data = {
            "userid": userId,
            "roomname": roomData.roomname,
            "publickey": publicKey
        }
        let response = await fetch(encryption_url,
                                   {
            method: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify(data)
        });
        while (messagesRef.current.length !== roomSize) {
            await sleep(1);
        }
        let key = 0;
        for (let i = 0; i < messagesRef.current.length; i++) {
            if (messagesRef.current[i].userid !== userId) {
                key += messagesRef.current[i].publickey;
            }
        }
        console.log("Key:", key)
        console.log(messagesRef.current);
        newMessages = [ ...messagesRef.current.slice(roomSize) ];
        setMessages(newMessages);
        messagesRef.current = newMessages;
        console.log(messagesRef.current);
        roomData.roomState = true

        data = {
            "userid": userId,
            "roomname": roomData.roomname,
            "publickey": key + privateKey
        }
        response = await fetch(encryption_url,
                                   {
            method: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify(data)
        });
        while (messagesRef.current.length !== roomSize) {
            await sleep(1);
        }

        let finalKey = 0
        for (let i = 0; i < messagesRef.current.length; i++) {
            if (messagesRef.current[i].userid !== userId) {
                finalKey += messagesRef.current[i].publickey;
            }
        }
        finalKey += privateKey + key
        setMessages([])

        setFinalKey(finalKey);
        finalKeyRef.current = finalKey;
        setDoneEncrypting(true);
        doneEncryptingRef.current = true;
        
        console.log(finalKey)
    }

    useEffect(() => {
        startRoomFlagRef.current = startRoomFlag;
    }, [startRoomFlag]);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    useEffect(() => {
        finalKeyRef.current = finalKey;
    }, [finalKey]);

    useEffect(() => {
        doneEncryptingRef.current = doneEncrypting;
    }, [doneEncrypting]);

    useEffect(() => {
        startRoom(); 
    }, []);

    socket.onmessage = (event) => {
        console.log("Receiving message")
        const newMessage = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, newMessage]); 
    }

    return(
        <div>
            {!doneEncrypting ? (
                <div className="flex h-full w-full">
                    {roomData.type === 1 ? (
                        <button onClick={setStartRoomFlagFunction}>Open Room</button>
                    ) : 
                        (
                            <h1 className="text-white">Waiting for host to open room</h1> 
                    )}            
                </div>
            ) : (
                <div className="flex h-full w-full">
                    <ChatWindow socket={socket} roomData={roomData} finalKey={finalKey} messages={messagesRef}/>
                </div>
            )}
        </div>
    )
}

export default WaitingRoom;
