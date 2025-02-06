package routes

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/websocket"
)

type JoinRoomRequest struct {
    RoomName string `json:"roomname"`
}

type JoinRoomResponse struct {
    Code int `json:"code"`
    Msg string `json:"message"`
}

type Message struct {
    Username string `json:"username"`
    Msg string `json:"message"`
}

type RoomState struct {
    Connections []*websocket.Conn
    Broadcast chan Message
    Locked bool
}

var (
    upgrader = websocket.Upgrader {
        CheckOrigin: func(r *http.Request) bool {
            return true
        },
    }

    Rooms = make(map[string]RoomState)
)



func JoinRoom(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    encoder := json.NewEncoder(w)
    
    var request JoinRoomRequest
    response := JoinRoomResponse { 
        Code: 200,
        Msg: "Successfully joined room",
    }

    // Try to decode message
    decoder := json.NewDecoder(r.Body)
    err := decoder.Decode(&request)
    if err != nil {
        response.Code = 400
        response.Msg = "Invalid Json"
        err := encoder.Encode(response)
        if err != nil { panic(err) }
        return
    }

    // Check if room is available
    if room, ok := Rooms[request.RoomName]; ok {
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
        err = conn.WriteJSON(response)
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

    Rooms[request.RoomName] = RoomState { 
        Connections: make([]*websocket.Conn, 0), 
        Broadcast: make(chan Message),
        Locked: false,
    } 

    room, ok := Rooms[request.RoomName]
    if ok {
        room.Connections = append(room.Connections, conn)
    }

    err = conn.WriteJSON(response)
    if err != nil { panic(err) }    
}
