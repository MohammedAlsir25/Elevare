import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 4000; // The port our backend will run on

// Middleware
app.use(cors()); // Allow requests from our frontend
app.use(express.json()); // Allow the server to understand JSON data

// A simple test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' });
});

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
