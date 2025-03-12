
# AI Token Gateway Backend

This is a simple Express.js backend that serves as a proxy between your frontend and the OpenAI API.

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create an environment file:
```bash
cp .env.example .env
```

3. Edit the `.env` file and add your OpenAI API key.

## Running the server

```bash
npm start
```

The server will run on port 3001 by default.

## API Endpoints

### POST /api/ai/chat
Sends a message to OpenAI and returns the response.

**Request Body:**
```json
{
  "prompt": "Your message here",
  "history": [
    {
      "role": "user",
      "content": "Previous user message"
    },
    {
      "role": "assistant",
      "content": "Previous assistant response"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "response": "AI response text",
  "tokenUsage": {
    "prompt": 10,
    "completion": 15,
    "total": 25
  }
}
```
