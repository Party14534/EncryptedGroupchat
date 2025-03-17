# TODO


## Encryption scheme
- User sends create room request
- Server broadcasts to users to send their public keys
    - When user receives a message from the server before they've been encrypted
    assume the room has been created.
        - The message will contain the size of the room
