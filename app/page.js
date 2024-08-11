'use client'
import { Box, Stack, Typography, TextField, Button } from "@mui/material";
import { useRef, useState, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Hi I am your personal chatbot'
  },])
  const [message, setMessage] = useState('')

  const chatContainerRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  // handlesend
  const sendMessage = async () => {
    if (message.trim() === '') return; // Prevent sending empty messages

    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    const response = await fetch('/api/chat', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = '';
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Uint8Array(), { stream: true });
        setMessages((messages) => {
          const lastMessage = messages[messages.length - 1];
          const otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
            },
          ];
        });
        return reader.read().then(processText);
      });
    });
  };

  //onclick enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction="column"
        width="450px"
        height="500px"
        border="1px solid black"
        p={2}
        spacing={3}
      >
        <Stack
          direction="column"
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
          spacing={3}
          ref={chatContainerRef}
          sx={{
            "&::-webkit-scrollbar": {
              width: '8px',
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: 'rgba(0,0,0,0.2)', //thumb
              borderRadius: '4px',
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: '#ffffff', // track 
            },
            paddingRight: '12px',
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
            >
              <Typography
                bgcolor={message.role === 'assistant' ? 'lightblue' : 'lightgreen'}
                p={2}
                borderRadius={6}
              >
                {message.content}
              </Typography>
            </Box>
          ))}
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center" p={0}>
          <TextField
            fullWidth
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
          />
          <Button
            variant="contained"
            color="primary"
            onClick={sendMessage}
          >
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
