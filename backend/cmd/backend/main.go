package main

import (
	"fmt"
	"net/http"

	"github.com/Party14534/EncryptedGroupchat/internal/routes"
)

var (
    port = 8080
)

func main() {
    http.HandleFunc("/join", routes.JoinRoom)
    http.HandleFunc("/message", routes.SendMessage)

    fmt.Printf("Server running on port: %d\n", port)
    err := http.ListenAndServe(fmt.Sprintf(":%d", port), nil)
    if err != nil {
        panic(err)
    }
}
