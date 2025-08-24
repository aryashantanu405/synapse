// packages/services/api-server/index.js

import express from 'express';
import cors from 'cors';

const app = express();
const port = 4000; // The port for your backend

app.use(cors());

app.get('/',(req,res)=>{
  res.send("this is main page")
})

// Your test route
app.get('/api/health', (req, res) => {
  res.json({ status: "ok", message: "kaisa hai next js bhai...mai express hu" });
});

app.listen(port, () => {
  console.log(`🚀 API server listening on http://localhost:${port}`);
});