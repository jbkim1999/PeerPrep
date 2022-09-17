import React, { useEffect } from "react";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { useSearchParams, useNavigate } from "react-router-dom";
// import { io } from "socket.io-client";

export default function RoomPage() {
    // const socket = io("http://localhost:8001");
    const navigate = useNavigate();
    const returnHome = event => {
        event.preventDefault()
        socket.emit("leave-room");
        socket.disconnect();
        console.log("Left")
        navigate("/difficulty")
    }

    // Retrieve Info
    const [searchparams] = useSearchParams();
    const socket = searchparams.get("communications");
    const roomID = searchparams.get("roomID")
    console.log("Received as: " + roomID)

    // Communications
    useEffect(() => {
        socket.on("disconnect", (reason) => {
            if (reason === "io client disconnect") {
              socket.emit("leave-room");
              console.log("Manual Left")
            }
        })
        return() => {
            socket.off("disconnect");
        };
    }, [socket]);

    return (
        <Box>
            <h1>
                Room
            </h1>
            <h1>
                Room ID: {roomID}
            </h1>
            <Button onClick={returnHome}
              type="submit"
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              startIcon={<KeyboardReturnIcon />}
            >
              Return
            </Button>
        </Box>
    )
}