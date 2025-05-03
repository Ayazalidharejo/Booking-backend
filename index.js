
// // File: server.js - All code in one file
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');

// // Load environment variables
// dotenv.config();

// // Initialize express app
// const app = express();

// // Middleware
// app.use(cors({origin:["https://ticket-booking-gray.vercel.app","http://localhost:3000"]}));
// app.use(express.json());

// //https://ticket-booking-gray.vercel.app/
// // JWT Secret
// const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey';

// // Connect to MongoDB
// mongoose.connect(process.env.DB_PASSWORD)
// .then(() => console.log('Connected to MongoDB'))
// .catch(err => console.error('Could not connect to MongoDB', err));

// // ==================== MODELS ====================

// // User Model
// const UserSchema = new mongoose.Schema({
//   username: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   date: {
//     type: Date,
//     default: Date.now
//   }
// });

// const User = mongoose.model('User', UserSchema);

// // Event Model
// const EventSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   description: {
//     type: String,
//     required: true
//   },
//   date: {
//     type: Date,
//     required: true
//   },
//   location: {
//     type: String,
//     required: true
//   },
//   tickets: [{
//     ticketType: {
//       type: String,
//       required: true
//     },
//     price: {
//       type: Number,
//       required: true
//     },
//     availability: {
//       type: Number,
//       default: 10
//     }
//   }],
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// const Event = mongoose.model('Event', EventSchema);

// // Ticket Model
// const TicketSchema = new mongoose.Schema({
//   eventName: {
//     type: String,
//     required: true
//   },
//   ticketType: {
//     type: String,
//     required: true
//   },
//   price: {
//     type: Number,
//     required: true
//   },
//   availability: {
//     type: Number,
//     default: 10
//   },
//   eventId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Event',
//     required: true
//   }
// });

// const Ticket = mongoose.model('Ticket', TicketSchema);

// // Booking Model
// const BookingSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   ticketId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Ticket',
//     required: true
//   },
//   eventName: {
//     type: String,
//     required: true
//   },
//   ticketType: {
//     type: String,
//     required: true
//   },
//   quantity: {
//     type: Number,
//     required: true,
//     default: 1
//   },
//   price: {
//     type: Number,
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['active', 'cancelled'],
//     default: 'active'
//   },
//   bookingDate: {
//     type: Date,
//     default: Date.now
//   }
// });

// const Booking = mongoose.model('Booking', BookingSchema);

// // ==================== MIDDLEWARE ====================

// // Auth Middleware
// const auth = function(req, res, next) {
//   // Get token from header
//   const token = req.header('Authorization')?.replace('Bearer ', '');

//   // Check if no token
//   if (!token) {
//     return res.status(401).json({ message: 'No token, authorization denied' });
//   }

//   // Verify token
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     req.user = decoded.user;
//     next();
//   } catch (err) {
//     res.status(401).json({ message: 'Token is not valid' });
//   }
// };


// app.post('/api/users/register', async (req, res) => {
//   const { username, email, password } = req.body;

//   try {
//     // Check if user already exists
//     let user = await User.findOne({ email });
//     if (user) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     // Check if username is taken
//     user = await User.findOne({ username });
//     if (user) {
//       return res.status(400).json({ message: 'Username already taken' });
//     }

//     // Create new user
//     user = new User({
//       username,
//       email,
//       password
//     });

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(password, salt);

//     // Save user to database
//     await user.save();

//     // Create payload for JWT
//     const payload = {
//       user: {
//         id: user.id
//       }
//     };

//     // Generate JWT
//     jwt.sign(
//       payload,
//       JWT_SECRET,
//       { expiresIn: '7d' },
//       (err, token) => {
//         if (err) throw err;
//         res.json({ 
//           token,
//           userId: user.id,
//           username: user.username
//         });
//       }
//     );
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // @route   POST api/users/login
// // @desc    Authenticate user & get token
// // @access  Public
// app.post('/api/users/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Check if user exists
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     // Check password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     // Create payload for JWT
//     const payload = {
//       user: {
//         id: user.id
//       }
//     };

//     // Generate JWT
//     jwt.sign(
//       payload,
//       JWT_SECRET,
//       { expiresIn: '7d' },
//       (err, token) => {
//         if (err) throw err;
//         res.json({ 
//           token,
//           userId: user.id,
//           username: user.username
//         });
//       }
//     );
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // @route   GET api/users/me
// // @desc    Get current user
// // @access  Private
// app.get('/api/users/me', auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('-password');
//     res.json(user);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // @route   GET api/events
// // @desc    Get all events
// // @access  Public
// app.get('/api/events', async (req, res) => {
//   try {
//     const events = await Event.find().sort({ date: 1 });
//     res.json(events);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // @route   GET api/events/:id
// // @desc    Get event by ID
// // @access  Public
// app.get('/api/events/:id', async (req, res) => {
//   try {
//     const event = await Event.findById(req.params.id);
    
//     if (!event) {
//       return res.status(404).json({ message: 'Event not found' });
//     }
    
//     res.json(event);
//   } catch (err) {
//     console.error(err.message);
//     if (err.kind === 'ObjectId') {
//       return res.status(404).json({ message: 'Event not found' });
//     }
//     res.status(500).send('Server error');
//   }
// });

// // @route   POST api/events
// // @desc    Create a new event
// // @access  Private
// app.post('/api/events', auth, async (req, res) => {
//   const { name, description, date, location, tickets } = req.body;

//   try {
//     // Create new event
//     const newEvent = new Event({
//       name,
//       description,
//       date,
//       location,
//       tickets,
//       createdBy: req.user.id
//     });

//     const event = await newEvent.save();
    
//     // Create individual tickets in Ticket collection
//     for (const ticket of tickets) {
//       const newTicket = new Ticket({
//         eventName: name,
//         ticketType: ticket.ticketType,
//         price: ticket.price,
//         availability: ticket.availability,
//         eventId: event._id
//       });
      
//       await newTicket.save();
//     }
    
//     res.json(event);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // @route   PUT api/events/:id
// // @desc    Update an event
// // @access  Private
// app.put('/api/events/:id', auth, async (req, res) => {
//   const { name, description, date, location, tickets } = req.body;

//   try {
//     let event = await Event.findById(req.params.id);
    
//     if (!event) {
//       return res.status(404).json({ message: 'Event not found' });
//     }
    
//     // Check user authorization
//     if (event.createdBy.toString() !== req.user.id) {
//       return res.status(401).json({ message: 'User not authorized' });
//     }
    
//     // Update event
//     event = await Event.findByIdAndUpdate(
//       req.params.id,
//       { $set: { name, description, date, location, tickets } },
//       { new: true }
//     );
    
//     // Update tickets in Ticket collection
//     await Ticket.deleteMany({ eventId: req.params.id });
    
//     for (const ticket of tickets) {
//       const newTicket = new Ticket({
//         eventName: name,
//         ticketType: ticket.ticketType,
//         price: ticket.price,
//         availability: ticket.availability,
//         eventId: event._id
//       });
      
//       await newTicket.save();
//     }
    
//     res.json(event);
//   } catch (err) {
//     console.error(err.message);
//     if (err.kind === 'ObjectId') {
//       return res.status(404).json({ message: 'Event not found' });
//     }
//     res.status(500).send('Server error');
//   }
// });

// // @route   DELETE api/events/:id
// // @desc    Delete an event
// // @access  Private
// app.delete('/api/events/:id', auth, async (req, res) => {
//   try {
//     const event = await Event.findById(req.params.id);
    
//     if (!event) {
//       return res.status(404).json({ message: 'Event not found' });
//     }
    
//     // Check user authorization
//     if (event.createdBy.toString() !== req.user.id) {
//       return res.status(401).json({ message: 'User not authorized' });
//     }
    
//     // Delete event
//     await Event.findByIdAndDelete(req.params.id);
    
//     // Delete associated tickets
//     await Ticket.deleteMany({ eventId: req.params.id });
    
//     res.json({ message: 'Event removed' });
//   } catch (err) {
//     console.error(err.message);
//     if (err.kind === 'ObjectId') {
//       return res.status(404).json({ message: 'Event not found' });
//     }
//     res.status(500).send('Server error');
//   }
// });

// // @route   GET api/tickets
// // @desc    Get all tickets
// // @access  Public
// app.get('/api/tickets', async (req, res) => {
//   try {
//     const tickets = await Ticket.find().sort({ price: 1 });
//     res.json(tickets);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // @route   GET api/tickets/:id
// // @desc    Get ticket by ID
// // @access  Public
// app.get('/api/tickets/:id', async (req, res) => {
//   try {
//     const ticket = await Ticket.findById(req.params.id);
    
//     if (!ticket) {
//       return res.status(404).json({ message: 'Ticket not found' });
//     }
    
//     res.json(ticket);
//   } catch (err) {
//     console.error(err.message);
//     if (err.kind === 'ObjectId') {
//       return res.status(404).json({ message: 'Ticket not found' });
//     }
//     res.status(500).send('Server error');
//   }
// });

// // @route   GET api/tickets/event/:eventId
// // @desc    Get tickets by event ID
// // @access  Public
// app.get('/api/tickets/event/:eventId', async (req, res) => {
//   try {
//     const tickets = await Ticket.find({ eventId: req.params.eventId });
//     res.json(tickets);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // @route   POST api/tickets
// // @desc    Create a new ticket
// // @access  Private
// app.post('/api/tickets', auth, async (req, res) => {
//   const { eventName, ticketType, price, availability, eventId } = req.body;

//   try {
//     // Check if event exists
//     const event = eventId ? await Event.findById(eventId) : null;
    
//     // Create new ticket
//     const newTicket = new Ticket({
//       eventName: eventName || (event ? event.name : ''),
//       ticketType,
//       price,
//       availability,
//       eventId: eventId || (event ? event._id : null)
//     });
    
//     const ticket = await newTicket.save();
//     res.json(ticket);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // @route   PUT api/tickets/:id
// // @desc    Update ticket availability
// // @access  Private
// app.put('/api/tickets/:id', auth, async (req, res) => {
//   const { availability } = req.body;

//   try {
//     let ticket = await Ticket.findById(req.params.id);
    
//     if (!ticket) {
//       return res.status(404).json({ message: 'Ticket not found' });
//     }
    
//     // Update ticket
//     ticket = await Ticket.findByIdAndUpdate(
//       req.params.id,
//       { $set: { availability } },
//       { new: true }
//     );
    
//     // Update ticket in Event document
//     const event = await Event.findById(ticket.eventId);
//     if (event) {
//       const ticketIndex = event.tickets.findIndex(t => t.ticketType === ticket.ticketType);
//       if (ticketIndex !== -1) {
//         event.tickets[ticketIndex].availability = availability;
//         await event.save();
//       }
//     }
    
//     res.json(ticket);
//   } catch (err) {
//     console.error(err.message);
//     if (err.kind === 'ObjectId') {
//       return res.status(404).json({ message: 'Ticket not found' });
//     }
//     res.status(500).send('Server error');
//   }
// });

// // @route   GET api/bookings
// // @desc    Get all bookings for current user
// // @access  Private
// app.get('/api/bookings', auth, async (req, res) => {
//   try {
//     const bookings = await Booking.find({ userId: req.user.id })
//                               .sort({ bookingDate: -1 });
//     res.json(bookings);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // @route   GET api/bookings/:id
// // @desc    Get booking by ID
// // @access  Private
// app.get('/api/bookings/:id', auth, async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id);
    
//     if (!booking) {
//       return res.status(404).json({ message: 'Booking not found' });
//     }
    
//     // Verify user owns this booking
//     if (booking.userId.toString() !== req.user.id) {
//       return res.status(401).json({ message: 'User not authorized' });
//     }
    
//     res.json(booking);
//   } catch (err) {
//     console.error(err.message);
//     if (err.kind === 'ObjectId') {
//       return res.status(404).json({ message: 'Booking not found' });
//     }
//     res.status(500).send('Server error');
//   }
// });

// // @route   POST api/bookings
// // @desc    Create a new booking
// // @access  Private
// app.post('/api/bookings', auth, async (req, res) => {
//   const { ticketId, quantity } = req.body;

//   try {
//     // Get ticket info
//     const ticket = await Ticket.findById(ticketId);
//     if (!ticket) {
//       return res.status(404).json({ message: 'Ticket not found' });
//     }
    
//     // Check availability
//     if (ticket.availability < quantity) {
//       return res.status(400).json({ message: 'Not enough tickets available' });
//     }
    
//     // Create booking
//     const newBooking = new Booking({
//       userId: req.user.id,
//       ticketId,
//       eventName: ticket.eventName,
//       ticketType: ticket.ticketType,
//       quantity,
//       price: ticket.price * quantity
//     });
    
//     // Update ticket availability
//     ticket.availability -= quantity;
//     await ticket.save();
    
//     // Update event ticket availability
//     const event = await Event.findById(ticket.eventId);
//     if (event) {
//       const ticketIndex = event.tickets.findIndex(t => t.ticketType === ticket.ticketType);
//       if (ticketIndex !== -1) {
//         event.tickets[ticketIndex].availability -= quantity;
//         await event.save();
//       }
//     }
    
//     const booking = await newBooking.save();
//     res.json(booking);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // @route   PATCH api/bookings/:id/cancel
// // @desc    Cancel a booking
// // @access  Private
// app.patch('/api/bookings/:id/cancel', auth, async (req, res) => {
//   try {
//     let booking = await Booking.findById(req.params.id);
    
//     if (!booking) {
//       return res.status(404).json({ message: 'Booking not found' });
//     }
    
//     // Verify user owns this booking
//     if (booking.userId.toString() !== req.user.id) {
//       return res.status(401).json({ message: 'User not authorized' });
//     }
    
//     // Check if already cancelled
//     if (booking.status === 'cancelled') {
//       return res.status(400).json({ message: 'Booking already cancelled' });
//     }
    
//     // Update booking status
//     booking = await Booking.findByIdAndUpdate(
//       req.params.id,
//       { $set: { status: 'cancelled' } },
//       { new: true }
//     );
    
//     // Restore ticket availability
//     const ticket = await Ticket.findById(booking.ticketId);
//     if (ticket) {
//       ticket.availability += booking.quantity;
//       await ticket.save();
      
//       // Update event ticket availability
//       const event = await Event.findById(ticket.eventId);
//       if (event) {
//         const ticketIndex = event.tickets.findIndex(t => t.ticketType === ticket.ticketType);
//         if (ticketIndex !== -1) {
//           event.tickets[ticketIndex].availability += booking.quantity;
//           await event.save();
//         }
//       }
//     }
    
//     res.json(booking);
//   } catch (err) {
//     console.error(err.message);
//     if (err.kind === 'ObjectId') {
//       return res.status(404).json({ message: 'Booking not found' });
//     }
//     res.status(500).send('Server error');
//   }
// });

// // Root route
// app.get('/', (req, res) => {
//   res.send('Welcome to the Event Booking System API');
// });

// // Start server
// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// module.exports = app;



























































































// File: server.js - All code in one file with SQLite3
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors({origin:["https://ticket-booking-gray.vercel.app","http://localhost:3000"]}));
app.use(express.json());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey';

// Database setup
let db;

async function setupDatabase() {
  // Open database
  db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      date TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      location TEXT NOT NULL,
      createdBy INTEGER NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (createdBy) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eventName TEXT NOT NULL,
      ticketType TEXT NOT NULL,
      price REAL NOT NULL,
      availability INTEGER DEFAULT 10,
      eventId INTEGER NOT NULL,
      FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      ticketId INTEGER NOT NULL,
      eventName TEXT NOT NULL,
      ticketType TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      price REAL NOT NULL,
      status TEXT DEFAULT 'active',
      bookingDate TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (ticketId) REFERENCES tickets(id)
    );
  `);

  console.log('Database setup complete');
}

// Initialize database
setupDatabase().catch(err => {
  console.error('Database setup failed:', err);
  process.exit(1);
});

// ==================== MIDDLEWARE ====================

// Auth Middleware
const auth = function(req, res, next) {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// ==================== ROUTES ====================

// @route   POST api/users/register
// @desc    Register a user
// @access  Public
app.post('/api/users/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const userByEmail = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (userByEmail) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if username is taken
    const userByUsername = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (userByUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const result = await db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    // Create payload for JWT
    const payload = {
      user: {
        id: result.lastID
      }
    };

    // Generate JWT
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          userId: result.lastID,
          username: username
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/users/login
// @desc    Authenticate user & get token
// @access  Public
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create payload for JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    // Generate JWT
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          userId: user.id,
          username: user.username
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/me
// @desc    Get current user
// @access  Private
app.get('/api/users/me', auth, async (req, res) => {
  try {
    const user = await db.get('SELECT id, username, email, date FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/events
// @desc    Get all events
// @access  Public
app.get('/api/events', async (req, res) => {
  try {
    const events = await db.all('SELECT * FROM events ORDER BY date ASC');
    
    // For each event, get its tickets
    for (let event of events) {
      const tickets = await db.all('SELECT * FROM tickets WHERE eventId = ?', [event.id]);
      event.tickets = tickets;
    }
    
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/events/:id
// @desc    Get event by ID
// @access  Public
app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await db.get('SELECT * FROM events WHERE id = ?', [req.params.id]);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Get tickets for this event
    const tickets = await db.all('SELECT * FROM tickets WHERE eventId = ?', [event.id]);
    event.tickets = tickets;
    
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/events
// @desc    Create a new event
// @access  Private
app.post('/api/events', auth, async (req, res) => {
  const { name, description, date, location, tickets } = req.body;

  try {
    // Create new event
    const result = await db.run(
      'INSERT INTO events (name, description, date, location, createdBy) VALUES (?, ?, ?, ?, ?)',
      [name, description, date, location, req.user.id]
    );
    
    const eventId = result.lastID;
    
    // Create individual tickets
    for (const ticket of tickets) {
      await db.run(
        'INSERT INTO tickets (eventName, ticketType, price, availability, eventId) VALUES (?, ?, ?, ?, ?)',
        [name, ticket.ticketType, ticket.price, ticket.availability, eventId]
      );
    }
    
    // Get the created event with tickets
    const event = await db.get('SELECT * FROM events WHERE id = ?', [eventId]);
    const eventTickets = await db.all('SELECT * FROM tickets WHERE eventId = ?', [eventId]);
    event.tickets = eventTickets;
    
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/events/:id
// @desc    Update an event
// @access  Private
app.put('/api/events/:id', auth, async (req, res) => {
  const { name, description, date, location, tickets } = req.body;

  try {
    // Check if event exists and user is authorized
    const event = await db.get(
      'SELECT * FROM events WHERE id = ?', 
      [req.params.id]
    );
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check user authorization
    if (event.createdBy !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Update event
    await db.run(
      'UPDATE events SET name = ?, description = ?, date = ?, location = ? WHERE id = ?',
      [name, description, date, location, req.params.id]
    );
    
    // Delete all existing tickets for this event
    await db.run('DELETE FROM tickets WHERE eventId = ?', [req.params.id]);
    
    // Create new tickets
    for (const ticket of tickets) {
      await db.run(
        'INSERT INTO tickets (eventName, ticketType, price, availability, eventId) VALUES (?, ?, ?, ?, ?)',
        [name, ticket.ticketType, ticket.price, ticket.availability, req.params.id]
      );
    }
    
    // Get updated event with tickets
    const updatedEvent = await db.get('SELECT * FROM events WHERE id = ?', [req.params.id]);
    const eventTickets = await db.all('SELECT * FROM tickets WHERE eventId = ?', [req.params.id]);
    updatedEvent.tickets = eventTickets;
    
    res.json(updatedEvent);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/events/:id
// @desc    Delete an event
// @access  Private
app.delete('/api/events/:id', auth, async (req, res) => {
  try {
    // Check if event exists and user is authorized
    const event = await db.get(
      'SELECT * FROM events WHERE id = ?', 
      [req.params.id]
    );
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check user authorization
    if (event.createdBy !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Delete event (tickets will be deleted due to CASCADE)
    await db.run('DELETE FROM events WHERE id = ?', [req.params.id]);
    
    res.json({ message: 'Event removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/tickets
// @desc    Get all tickets
// @access  Public
app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await db.all('SELECT * FROM tickets ORDER BY price ASC');
    res.json(tickets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/tickets/:id
// @desc    Get ticket by ID
// @access  Public
app.get('/api/tickets/:id', async (req, res) => {
  try {
    const ticket = await db.get('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    res.json(ticket);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/tickets/event/:eventId
// @desc    Get tickets by event ID
// @access  Public
app.get('/api/tickets/event/:eventId', async (req, res) => {
  try {
    const tickets = await db.all('SELECT * FROM tickets WHERE eventId = ?', [req.params.eventId]);
    res.json(tickets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/tickets
// @desc    Create a new ticket
// @access  Private
app.post('/api/tickets', auth, async (req, res) => {
  const { eventName, ticketType, price, availability, eventId } = req.body;

  try {
    // Check if event exists
    let eventName2 = eventName;
    if (eventId) {
      const event = await db.get('SELECT name FROM events WHERE id = ?', [eventId]);
      if (event) {
        eventName2 = event.name;
      }
    }
    
    // Create new ticket
    const result = await db.run(
      'INSERT INTO tickets (eventName, ticketType, price, availability, eventId) VALUES (?, ?, ?, ?, ?)',
      [eventName2 || '', ticketType, price, availability, eventId]
    );
    
    const ticket = await db.get('SELECT * FROM tickets WHERE id = ?', [result.lastID]);
    res.json(ticket);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/tickets/:id
// @desc    Update ticket availability
// @access  Private
app.put('/api/tickets/:id', auth, async (req, res) => {
  const { availability } = req.body;

  try {
    // Check if ticket exists
    const ticket = await db.get('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    // Update ticket
    await db.run(
      'UPDATE tickets SET availability = ? WHERE id = ?',
      [availability, req.params.id]
    );
    
    const updatedTicket = await db.get('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
    res.json(updatedTicket);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/bookings
// @desc    Get all bookings for current user
// @access  Private
app.get('/api/bookings', auth, async (req, res) => {
  try {
    const bookings = await db.all(
      'SELECT * FROM bookings WHERE userId = ? ORDER BY bookingDate DESC',
      [req.user.id]
    );
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/bookings/:id
// @desc    Get booking by ID
// @access  Private
app.get('/api/bookings/:id', auth, async (req, res) => {
  try {
    const booking = await db.get('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Verify user owns this booking
    if (booking.userId !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/bookings
// @desc    Create a new booking
// @access  Private
app.post('/api/bookings', auth, async (req, res) => {
  const { ticketId, quantity } = req.body;

  try {
    // Get ticket info
    const ticket = await db.get('SELECT * FROM tickets WHERE id = ?', [ticketId]);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    // Check availability
    if (ticket.availability < quantity) {
      return res.status(400).json({ message: 'Not enough tickets available' });
    }
    
    // Create booking
    const result = await db.run(
      'INSERT INTO bookings (userId, ticketId, eventName, ticketType, quantity, price) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, ticketId, ticket.eventName, ticket.ticketType, quantity, ticket.price * quantity]
    );
    
    // Update ticket availability
    await db.run(
      'UPDATE tickets SET availability = availability - ? WHERE id = ?',
      [quantity, ticketId]
    );
    
    const booking = await db.get('SELECT * FROM bookings WHERE id = ?', [result.lastID]);
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PATCH api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
app.patch('/api/bookings/:id/cancel', auth, async (req, res) => {
  try {
    // Get booking
    const booking = await db.get('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Verify user owns this booking
    if (booking.userId !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Check if already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }
    
    // Update booking status
    await db.run(
      'UPDATE bookings SET status = ? WHERE id = ?',
      ['cancelled', req.params.id]
    );
    
    // Restore ticket availability
    await db.run(
      'UPDATE tickets SET availability = availability + ? WHERE id = ?',
      [booking.quantity, booking.ticketId]
    );
    
    const updatedBooking = await db.get('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    res.json(updatedBooking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Event Booking System API (SQLite3 Version)');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;