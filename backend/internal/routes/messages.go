package routes

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type MessageRequest struct {
    RoomName string `json:"roomname"`
    Username string `json:"username"`
    Msg string `json:"msg"`
}

type MessageResponse struct {
    Code int `json:"code"`
    Msg string `json:"msg"`
}

func SendMessage(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    encoder := json.NewEncoder(w)

    var message MessageRequest
    response := MessageResponse {
        Code: 200,
    }

    decoder := json.NewDecoder(r.Body) 
    err := decoder.Decode(&message)
    if err != nil {
        response.Code = 400
        response.Msg = "Invalid Json"
        err := encoder.Encode(response)
        if err != nil { panic(err) }
        return
    }

    if room, ok := Rooms[message.RoomName]; ok {
        room.Broadcast <- message
    }
}

// Go routine
func HandleMessages(roomName string) {
    room := Rooms[roomName]
    fmt.Println(len(room.Connections))
    for {
        msg := <- room.Broadcast        
        sentMsg := true
        for i, client := range room.Connections {
            fmt.Println(i)
            err := client.WriteJSON(msg)
            if err != nil {
                fmt.Println(err)
                client.Close()
                room.Connections = append(room.Connections[:i], 
                    room.Connections[i+1:]...)        
            } else {
                sentMsg = true
            }
        }

        if !sentMsg {
            RoomsMutex.Lock()
            delete(Rooms, roomName)
            RoomsMutex.Unlock()
            return
        }
    }
}
