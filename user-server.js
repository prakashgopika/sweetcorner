const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

app.use(express.static(path.join(__dirname))); 


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on('connected', () => {
  console.log('Successfully connected to MongoDB Atlas');
});
mongoose.connection.on('error', (err) => {
  console.error('Error connecting to MongoDB Atlas:', err);
});

// Dessert Schema and Model
const dessertSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, required: true },
});
const Dessert = mongoose.model('Dessert', dessertSchema);

// Multer Configuration for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Routes
app.get('/desserts', async (req, res) => {
  try {
    const desserts = await Dessert.find();
    res.json(desserts);
  } catch (error) {
    res.status(500).send('Error fetching desserts: ' + error.message);
  }
});

app.post('/add-dessert', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const image = req.file.path;
    const newDessert = new Dessert({ name, description, price, image });
    await newDessert.save();
    res.redirect('/');
  } catch (error) {
    res.status(500).send('Error adding dessert: ' + error.message);
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'user-view.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});


// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start Server
const PORT = process.env.PORT || 7001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
