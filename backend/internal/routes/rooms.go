package routes

import (
	"encoding/json"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type JoinRoomResponse struct {
    Code int `json:"code"`
    Msg string `json:"message"`
}


type RoomState struct {
    Connections []*websocket.Conn
    Broadcast chan MessageRequest
    Locked bool
}

var (
    upgrader = websocket.Upgrader {
        CheckOrigin: func(r *http.Request) bool {
            return true
        },
    }

    Rooms = make(map[string]*RoomState)
    RoomsMutex = new(sync.Mutex)
)


func JoinRoom(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    encoder := json.NewEncoder(w)

    response := JoinRoomResponse { 
        Code: 200,
        Msg: "Successfully joined room",
    }
    
    roomName := r.URL.Query().Get("roomname")
    if roomName == "" {
        response.Code = 400
        response.Msg = "Room name not given in query"
        err := encoder.Encode(response)
        if err != nil { panic(err) }
        return
        
    }

    // Check if room is available
    if room, ok := Rooms[roomName]; ok {
        if room.Locked {
            response.Code = 403
            response.Msg = "Room is not available"
            err := encoder.Encode(response)
            if err != nil { panic(err) }
            return
        }

        conn, err := upgrader.Upgrade(w, r, nil)
        if err != nil {
            response.Code = 400
            response.Msg = "Unable to create websocket connection"
            err := encoder.Encode(response)
            if err != nil { panic(err) }
            return
        }

        room.Connections = append(room.Connections, conn)
        response.Code = 201
        err = conn.WriteJSON(response)
        if err != nil { panic(err) }
        return
    }
    
    // If room does not exist already
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        println(err.Error())
        response.Code = 400
        response.Msg = "Unable to create websocket connection"
        err := encoder.Encode(response)
        if err != nil { panic(err) }
        return
    }

    RoomsMutex.Lock()
    Rooms[roomName] = &RoomState { 
        Connections: make([]*websocket.Conn, 0), 
        Broadcast: make(chan MessageRequest),
        Locked: false,
    } 

    room, ok := Rooms[roomName]
    if ok {
        room.Connections = append(room.Connections, conn)
    }
    RoomsMutex.Unlock()

    // Start room go routine
    go HandleMessages(roomName)

    err = conn.WriteJSON(response)
    if err != nil { panic(err) }
}
