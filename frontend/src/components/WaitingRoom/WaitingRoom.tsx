import { RoomData } from "../LoginWindow/LoginWindow";

const WaitingRoom: React.FC<{roomData: RoomData, socket: WebSocket}> = ( {roomData, socket} ) => {
    return(
        <div className="flex h-full w-full">
            {roomData.type === 1 ? (
                <button>Open Room</button>
            ) : 
                (
                    <h1 className="text-white">Waiting for host to open room</h1> 
            )}            
        </div>
    )
}

export default WaitingRoom;
