const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectToDB = require('./config/connectToDB');

dotenv.config();
connectToDB();

const app = express();
const PORT = process.env.PORT || 8001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/doctor', require('./routes/doctorRoutes'));
app.get('/', (req, res) => {
  res.send('Book a Doctor API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});