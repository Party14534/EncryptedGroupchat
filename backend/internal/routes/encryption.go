package routes

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type StartEncryptionRequest struct {
    RoomName string `json:"roomname"`
}

type StartEncryptionResponse struct {
    Code int `json:"code"`
    Msg string `json:"msg"`
}

type RoomDataResponse struct {
    UserId int `json:"userid"`
    RoomSize int `json:"roomsize"`
}

type EncryptRoomRequest struct {
    UserId int `json:"userid"`
    RoomName string `json:"roomname"`
    PublicKey int `json:"publickey"`
}

type EncryptRoomResponse struct {
    Code int `json:"code"`
    Msg string `json:"msg"`
}

func StartEncryption(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    encoder := json.NewEncoder(w)

    var message StartEncryptionRequest
    response := StartEncryptionResponse {
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
        if len(room.Connections) > 1 && !room.Locked { 
            err = encoder.Encode(response)
            if err != nil { panic(err) }
            // Start room encryption
            room.Locked = true
            
            roomData := RoomDataResponse {
                RoomSize: len(room.Connections),
            }

            for i, conn := range room.Connections {
                roomData.UserId = i
                err = conn.WriteJSON(roomData)
                if err != nil { panic(err) }
            }

            return
        }

        response.Code = 400
        response.Msg = "Room not full enough"
        err := encoder.Encode(response)
        if err != nil { panic(err) }
        return
    }
}

func EncryptRoom(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    encoder := json.NewEncoder(w)

    var message EncryptRoomRequest
    response := EncryptRoomResponse {
        Code: 200,
    }

    decoder := json.NewDecoder(r.Body) 
    err := decoder.Decode(&message)
    if err != nil {
        fmt.Println("Fail")
        response.Code = 400
        response.Msg = "Invalid Json"
        err := encoder.Encode(response)
        if err != nil { panic(err) }
        return
    }

    if room, ok := Rooms[message.RoomName]; ok {
        for _, conn := range room.Connections {
            err = conn.WriteJSON(message)
            if err != nil { panic(err) }
        }

        err = encoder.Encode(response)
        if err != nil { panic(err) }
        return
    } 
    
    fmt.Println("Invalid room")
    response.Code = 400
    response.Msg = "Invalid Room"
    err = encoder.Encode(response)
    if err != nil { panic(err) }
}
