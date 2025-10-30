require('dotenv').config();


const express = require('express');
const app = express();
const authRoutes = require('./src/routes/auth.routes');

// Middleware pour parser le JSON
app.use(express.json());

// Utiliser les routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});