const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
    console.log('Successfully connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
    console.error('Error connecting to MongoDB Atlas:', err);
});

// Ensure 'uploads' directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Define Schema and Model
const dessertSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    image: String,
});
const Dessert = mongoose.model('Dessert', dessertSchema);

// Set up Multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});
const upload = multer({ storage });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve static files (including admin-form.html and uploads)

// Admin Route to Add Dessert
app.post('/add-dessert', upload.single('image'), async (req, res) => {
    const { name, description, price } = req.body;
    const image = req.file ? req.file.filename : null;

    try {
        const newDessert = new Dessert({ name, description, price, image });
        await newDessert.save();
        res.send(`
            <script>
                alert('Your dessert was successfully added!');
                window.location.href = '/admin-form'; // Redirect back to the admin form
            </script>
        `);
    } catch (error) {
        res.status(500).send(`
            <script>
                alert('Error adding dessert: ${error.message}');
                window.location.href = '/admin-form'; // Redirect back to the admin form
            </script>
        `);
    }
});

// Serve Admin Form
app.get('/admin-form', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-form.html')); // Ensure this path is correct
});


// Start Server
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
