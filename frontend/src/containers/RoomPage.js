import React, { useContext, useEffect, useRef, useState, useLayoutEffect, Fragment} from "react";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { Container, Divider, FormControl, Grid, IconButton, List, ListItem, ListItemText, Paper, TextField, Typography } from "@mui/material";
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { useSearchParams, useNavigate } from "react-router-dom";
import SocketContext from "../contexts/CreateContext";
import { borders } from '@mui/system';
import SendIcon from '@mui/icons-material/Send';

import io from 'socket.io-client';
import "quill/dist/quill.snow.css";
import Quill from "quill";


//Chat serviced to
export class ChatMessageDto {
    constructor(user, message){
        this.user = user;
        this.message = message;
    }
}

export default function RoomPage() {

    // Chat Service Stuff
    const ENTER_KEY_CODE = 13;

    const scrollBottomRef = useRef(null);
    const webSocket = useRef(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [user, setUser] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        console.log('Opening WebSocket');
        webSocket.current = new WebSocket('ws://localhost:8080/chat');
        const openWebSocket = () => {
            webSocket.current.onopen = (event) => {
                console.log('Open:', event);
            }
            webSocket.current.onclose = (event) => {
                console.log('Close:', event);
            }
        }
        openWebSocket();
        return () => {
            console.log('Closing WebSocket');
            webSocket.current.close();
        }
    }, []);

    useEffect(() => {
        webSocket.current.onmessage = (event) => {
            const chatMessageDto = JSON.parse(event.data);
            console.log('Message:', chatMessageDto);
            setChatMessages([...chatMessages, {
                user: chatMessageDto.user,
                message: chatMessageDto.message
            }]);
            if(scrollBottomRef.current) {
                scrollBottomRef.current.scrollIntoView({ behavior: 'smooth'});
            }
        }
    }, [chatMessages]);

    const handleUserChange = (event) => {
        setUser(event.target.value);
    }

    const handleMessageChange = (event) => {
        setMessage(event.target.value);
    }

    const handleEnterKey = (event) => {
        if(event.keyCode === ENTER_KEY_CODE){
            sendMessage();
        }
    }

    const sendMessage = () => {
        if(user && message) {
            console.log('Send!');
            webSocket.current.send(
                JSON.stringify(new ChatMessageDto(user, message))
            );
            setMessage('');
        }
    };

    const listChatMessages = chatMessages.map((chatMessageDto, index) => 
        <ListItem key={index}>
            <ListItemText primary={`${chatMessageDto.user}: ${chatMessageDto.message}`}/>
        </ListItem>
    );

    // Initialization
    function Socket() {
        const socket = useContext(SocketContext);
        return socket;
    }
    const socket = Socket();

    const navigate = useNavigate();
    const returnHome = event => {
        event.preventDefault()
        socket.emit("leave-room");
        console.log("Left")
        navigate("/difficulty")
    }

    // Retrieve Info
    const [searchparams] = useSearchParams();
    const roomID = searchparams.get("roomID");
    const difficulty = searchparams.get("difficulty");
    console.log("Received as: " + roomID);

    // Collab Service
    const [collabSocket, setCollabSocket] = useState();
    const [quill, setQuill] = useState();
    useEffect(() => {
        const collabS = io("http://localhost:3001");
        setCollabSocket(collabS);
        collabS.emit("join-room", roomID);

        return () => {
            collabS.disconnect();
        }
    }, []);
    

    useEffect(() => {
        if (collabSocket == null || quill == null) {
            return;
        }
        const handler = (delta, oldDelta, source) => {
            if (source !== "user") {
                return;
            }
            collabSocket.emit("send-changes", { delta, roomID });
        };
        quill.on("text-change", handler);

        return () => {
            quill.off("text-change", handler);
        }
    }, [collabSocket, quill]);

    useEffect(() => {
        if (collabSocket == null || quill == null) {
            return;
        }
        const handler = (delta) => {
            quill.updateContents(delta);
        };
        collabSocket.on("receive-changes", handler);

        return () => {
            collabSocket.off("receive-changes", handler);
        }
    }, [collabSocket, quill]);

    const wrapperRef = useRef();
    useLayoutEffect(() => {
        const editor = document.createElement("div");
        wrapperRef.current.append(editor);
        const q = new Quill(editor, { theme: "snow"});
        setQuill(q);
        return () => {
            wrapperRef.current.innerHTML = "";
        };
    }, []);

    // Matching Service --> Question Service
    const [questionTitle, setQuestionTitle] = useState("");
    const [questionDescription, setQuestionDescription] = useState("");
    useEffect(() => {
        if (socket.id === roomID) {
            socket.emit("request-question", { difficulty, roomID });
        }
        socket.on("distribute-question", (question) => {
            console.log(question);
            setQuestionTitle(question.existingQuestion.title);
            setQuestionDescription(question.existingQuestion.body);
        })

        return () => {
            socket.off("distribute-question");
        }
    }, []);

    function createMarkup(questionBody) {
        return {__html: questionBody}
    }

    function formatHtml(questionBody) {
        return <div class="content__u3I1 code"
        dangerouslySetInnerHTML={createMarkup(questionBody)} />;
    }

    return (
        <Box>
            <Box 
                sx={{
                    height: '25%',
                    margin: 2,
                }}>
                <Button onClick={returnHome}
                    type="submit"
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    startIcon={<KeyboardReturnIcon />}
                    >
                    Return to Difficulty Page
                </Button>
            </Box>
            <Box
                sx={{
                    margin: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    borderColor: 'primary.main',
                    borderRadius: '16px'
                }}>
                <Typography component="h1" variant="h5">
                    {questionTitle}
                </Typography>
                {formatHtml(questionDescription)}
            </Box>
                <div class="float-container">
                    <div class="float-collab" id="container" ref = {wrapperRef}></div>
                    <div class="float-chat">
                    <Fragment>
                        <Container>
                            <Paper elevation={5}>
                                <Box p={3}>
                                    <Typography variant="h6" gutterBottom>
                                        Chat Window
                                    </Typography>
                                    <Divider />
                                    <Grid container spacing={1} alignItems="center">
                                        <Grid id="chat-window" xs={12} item>
                                            <List id="chat-window-messages">
                                                {listChatMessages}
                                                <ListItem ref={scrollBottomRef}></ListItem>
                                            </List>
                                        </Grid>
                                        <Grid xs={2} item>
                                            <FormControl fullWidth>
                                                <TextField onChange={handleUserChange}
                                                    value={user}
                                                    label="Nickname"
                                                    variant="outlined" />
                                            </FormControl>
                                        </Grid>
                                        <Grid xs={9} item>
                                            <FormControl fullWidth>
                                                <TextField onChange={handleMessageChange} onKeyDown={handleEnterKey}
                                                    value={message}
                                                    label="Type your message..."
                                                    variant="outlined" />
                                            </FormControl>
                                        </Grid>
                                        <Grid xs={1} item>
                                            <IconButton onClick={sendMessage}
                                                aria-label="send"
                                                color="primary">
                                                <SendIcon />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Paper>
                        </Container>
                    </Fragment>
                    </div>
                </div>
            </Box>
    )
}
