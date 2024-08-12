'use client'
import { Box, Stack, Typography, TextField, Button, IconButton } from "@mui/material";
import { ThumbUp, ThumbDown } from "@mui/icons-material";
import { useRef, useState, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Hi there! I’m your personal chatbot. Feel free to ask me about the products you’ve seen on TikTok or anything else you need help with.',
    feedback: null,
  }]);
  const [message, setMessage] = useState('');

  const chatContainerRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (message.trim() === '') return;

    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '', feedback: null },
    ]);

    const filteredMessages = messages.map((msg) => {
      if (msg.role === 'assistant') {
        const { feedback, ...rest } = msg;
        return rest;
      }
      return msg;
    });

    const response = await fetch('/api/chat', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([...filteredMessages, { role: 'user', content: message }]),
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
              feedback: null
            },
          ];
        });
        return reader.read().then(processText);
      });
    });
  };

  const handleFeedback = (index, feedback) => {
    setMessages((messages) => {
      let updatedMessages = [...messages];
      updatedMessages[index].feedback = feedback;
      return updatedMessages;
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  }; return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="flex-start"
      sx={{
        backgroundImage: `url('/image.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        paddingLeft: '100px',
      }}
    >
      <Stack
        direction="column"
        width="450px"
        height="500px"
        border="1px solid black"
        p={2}
        spacing={3}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Typography variant="h5" component="h1" textAlign="center" gutterBottom>
          Ask me!!
        </Typography>

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
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: '#ffffff',
            },
            paddingRight: '12px',
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              flexDirection="column"
              alignItems={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
            >
              <Box position="relative" display="inline-block">
                <Typography
                  bgcolor={message.role === 'assistant' ? 'lightblue' : 'lightgreen'}
                  p={1.5}
                  pr={6}
                  borderRadius={4}
                  maxWidth="350px"
                  sx={{ wordBreak: 'break-word' }}
                >
                  {message.content}
                </Typography>
                {message.role === 'assistant' && (
                  <Box
                    position="absolute"
                    bottom="4px"
                    right="4px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <IconButton
                      color={message.feedback === 'positive' ? 'primary' : 'default'}
                      onClick={() => handleFeedback(index, 'positive')}
                      size="small"
                    >
                      <ThumbUp fontSize="small" />
                    </IconButton>
                    <IconButton
                      color={message.feedback === 'negative' ? 'error' : 'default'}
                      onClick={() => handleFeedback(index, 'negative')}
                      size="small"
                    >
                      <ThumbDown fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            fullWidth
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#ccc',
                },
                '&:hover fieldset': {
                  borderColor: '#aaa',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#263896',
                },
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={sendMessage}
            sx={{
              backgroundColor: '#263896',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#0056b3',
              },
            }}
          >
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}  