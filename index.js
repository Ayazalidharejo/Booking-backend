// // const express = require('express');
// // const mongoose = require('mongoose');
// // const cors = require('cors');
// // require('dotenv').config();

// // const authRoutes = require('./routes/auth');
// // const eventRoutes = require('./routes/events');
// // const bookingRoutes = require('./routes/bookings');

// // const app = express();
// // app.use(cors());
// // app.use(express.json());

// // mongoose.connect(
// //   `mongodb+srv://ayazalixwave:${process.env.DB_PASSWORD}@cluster0.95kzp.mongodb.net/event_management?retryWrites=true&w=majority`
// // ).then(() => console.log("MongoDB Connected"))
// //  .catch(err => console.error("DB Connection Failed", err));

// // app.use('/api/auth', authRoutes);
// // app.use('/api/events', eventRoutes);
// // app.use('/api/bookings', bookingRoutes);

// // app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));




// // BACKEND CODE (Node.js with Express and MongoDB)
// // File: backend/server.js

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// const app = express();
// const PORT = process.env.PORT || 5000;
// const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// // Middleware
// app.use(cors());
// app.use(express.json());

// // MongoDB Connection
// mongoose.connect(
//      `mongodb+srv://ayazalixwave:${process.env.DB_PASSWORD}@cluster0.95kzp.mongodb.net/event_management?retryWrites=true&w=majority`
//    ).then(() => console.log("MongoDB Connected"))
//     .catch(err => console.error("DB Connection Failed", err));
  
// // Models
// // User Model
// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now }
// });

// // Event Model
// const eventSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   description: { type: String, required: true },
//   date: { type: Date, required: true },
//   location: { type: String, required: true },
//   tickets: [{
//     ticketType: { type: String, required: true },
//     price: { type: Number, required: true },
//     availability: { type: Number, required: true }
//   }]
// });

// // Ticket Model
// const ticketSchema = new mongoose.Schema({
//   eventName: { type: String, required: true },
//   ticketType: { type: String, required: true },
//   price: { type: Number, required: true },
//   availability: { type: Number, required: true }
// });

// // Booking Model
// const bookingSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   eventName: { type: String, required: true },
//   ticketType: { type: String, required: true },
//   quantity: { type: Number, required: true, default: 1 },
//   price: { type: Number, required: true },
//   bookingDate: { type: Date, default: Date.now },
//   status: { type: String, enum: ['active', 'cancelled'], default: 'active' }
// });

// const User = mongoose.model('User', userSchema);
// const Event = mongoose.model('Event', eventSchema);
// const Ticket = mongoose.model('Ticket', ticketSchema);
// const Booking = mongoose.model('Booking', bookingSchema);

// // Authentication Middleware
// const auth = async (req, res, next) => {
//   try {
//     const token = req.header('Authorization').replace('Bearer ', '');
//     const decoded = jwt.verify(token, JWT_SECRET);
//     const user = await User.findById(decoded.id);
    
//     if (!user) {
//       throw new Error();
//     }
    
//     req.token = token;
//     req.user = user;
//     next();
//   } catch (error) {
//     res.status(401).json({ message: 'Authentication required' });
//   }
// };

// // Routes
// // User Registration
// app.post('/api/users/register', async (req, res) => {
//   try {
//     const { username, email, password } = req.body;
    
//     // Check if user exists
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: 'User already exists' });
//     }
    
//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);
    
//     // Create user
//     const user = new User({
//       username,
//       email,
//       password: hashedPassword
//     });
    
//     await user.save();
    
//     // Generate JWT
//     const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
    
//     res.status(201).json({
//       token,
//       userId: user._id,
//       username: user.username,
//       email: user.email
//     });
//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // User Login
// app.post('/api/users/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
    
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
    
//     // Generate JWT
//     const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
    
//     res.json({
//       token,
//       userId: user._id,
//       username: user.username,
//       email: user.email
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get Events
// app.get('/api/events', async (req, res) => {
//   try {
//     const events = await Event.find();
//     res.json(events);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get Available Tickets
// app.get('/api/tickets', async (req, res) => {
//   try {
//     const tickets = await Ticket.find();
//     res.json(tickets);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Book Ticket
// app.post('/api/bookings', auth, async (req, res) => {
//   try {
//     const { ticketId, quantity } = req.body;
    
//     // Find ticket
//     const ticket = await Ticket.findById(ticketId);
//     if (!ticket) {
//       return res.status(404).json({ message: 'Ticket not found' });
//     }
    
//     // Check availability
//     if (ticket.availability < quantity) {
//       return res.status(400).json({ message: 'Not enough tickets available' });
//     }
    
//     // Create booking
//     const booking = new Booking({
//       userId: req.user._id,
//       eventName: ticket.eventName,
//       ticketType: ticket.ticketType,
//       quantity,
//       price: ticket.price
//     });
    
//     await booking.save();
    
//     // Update ticket availability
//     ticket.availability -= quantity;
//     await ticket.save();
    
//     res.status(201).json(booking);
//   } catch (error) {
//     console.error('Booking error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get User Bookings
// app.get('/api/bookings', auth, async (req, res) => {
//   try {
//     const bookings = await Booking.find({ userId: req.user._id });
//     res.json(bookings);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });





// app.post('/api/tickets', async (req, res) => {
//   try {
//     const { eventName, ticketType, price, availability } = req.body;
    
//     // Validate input
//     if (!eventName || !ticketType || !price || availability === undefined) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }
    
//     // Create new ticket
//     const newTicket = new Ticket({
//       eventName,
//       ticketType,
//       price: Number(price),
//       availability: Number(availability)
//     });
    
//     // Save to database
//     await newTicket.save();
    
//     res.status(201).json({ 
//       success: true, 
//       message: 'Ticket created successfully', 
//       ticket: newTicket 
//     });
//   } catch (error) {
//     console.error('Error creating ticket:', error);
//     res.status(500).json({ message: 'Failed to create ticket' });
//   }
// });

// // Cancel Booking
// app.patch('/api/bookings/:id/cancel', auth, async (req, res) => {
//   try {
//     const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
    
//     if (!booking) {
//       return res.status(404).json({ message: 'Booking not found' });
//     }
    
//     if (booking.status === 'cancelled') {
//       return res.status(400).json({ message: 'Booking already cancelled' });
//     }
    
//     booking.status = 'cancelled';
//     await booking.save();
    
//     // Update ticket availability (optionally add the tickets back to availability)
//     const ticket = await Ticket.findOne({ 
//       eventName: booking.eventName, 
//       ticketType: booking.ticketType 
//     });
    
//     if (ticket) {
//       ticket.availability += booking.quantity;
//       await ticket.save();
//     }
    
//     res.json(booking);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Initialize some data
// const initializeData = async () => {
//   try {
//     // Check if events exist
//     const eventsCount = await Event.countDocuments();
    
//     if (eventsCount === 0) {
//       // Create some events
//       const events = [
//         { 
//           name: 'Summer Music Festival',
//           description: 'A weekend of great music and fun activities',
//           date: new Date('2025-06-15'),
//           location: 'Mumbai Beach Park',
//           tickets: [
//             { ticketType: 'VIP', price: 5000, availability: 15 },
//             { ticketType: 'General', price: 1500, availability: 100 },
//             { ticketType: 'Backstage', price: 8000, availability: 5 },
//           ]
//         },
//         { 
//           name: 'Comedy Night Special',
//           description: 'Laugh out loud with top comedians',
//           date: new Date('2025-05-20'),
//           location: 'Delhi Comedy Club',
//           tickets: [
//             // { ticketType: 'Front Row', price: 2500, availability: 20 },
//             { ticketType: 'Standard', price: 1000, availability: 80 }
//           ]
//         }
//       ];
      
//       await Event.insertMany(events);
//       console.log('Sample events created');
      
//       // Create tickets based on events
//       const ticketsToCreate = [];
      
//       events.forEach(event => {
//         event.tickets.forEach(ticket => {
//           ticketsToCreate.push({
//             eventName: event.name,
//             ticketType: ticket.ticketType,
//             price: ticket.price,
//             availability: ticket.availability
//           });
//         });
//       });
      
//       await Ticket.insertMany(ticketsToCreate);
//       console.log('Sample tickets created');
//     }
//   } catch (error) {
//     console.error('Error initializing data:', error);
//   }
// };





// // Start the server
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
//   initializeData();
// });














































































































// File: server.js - All code in one file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey';

// Connect to MongoDB
mongoose.connect(`mongodb+srv://ayazalixwave:${process.env.DB_PASSWORD}@cluster0.95kzp.mongodb.net/event_management?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

// ==================== MODELS ====================

// User Model
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);

// Event Model
const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  tickets: [{
    ticketType: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    availability: {
      type: Number,
      default: 10
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Event = mongoose.model('Event', EventSchema);

// Ticket Model
const TicketSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true
  },
  ticketType: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  availability: {
    type: Number,
    default: 10
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  }
});

const Ticket = mongoose.model('Ticket', TicketSchema);

// Booking Model
const BookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  eventName: {
    type: String,
    required: true
  },
  ticketType: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled'],
    default: 'active'
  },
  bookingDate: {
    type: Date,
    default: Date.now
  }
});

const Booking = mongoose.model('Booking', BookingSchema);

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
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if username is taken
    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Create new user
    user = new User({
      username,
      email,
      password
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();

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

// @route   POST api/users/login
// @desc    Authenticate user & get token
// @access  Public
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
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
    const user = await User.findById(req.user.id).select('-password');
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
    const events = await Event.find().sort({ date: 1 });
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
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
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
    const newEvent = new Event({
      name,
      description,
      date,
      location,
      tickets,
      createdBy: req.user.id
    });

    const event = await newEvent.save();
    
    // Create individual tickets in Ticket collection
    for (const ticket of tickets) {
      const newTicket = new Ticket({
        eventName: name,
        ticketType: ticket.ticketType,
        price: ticket.price,
        availability: ticket.availability,
        eventId: event._id
      });
      
      await newTicket.save();
    }
    
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
    let event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check user authorization
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Update event
    event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: { name, description, date, location, tickets } },
      { new: true }
    );
    
    // Update tickets in Ticket collection
    await Ticket.deleteMany({ eventId: req.params.id });
    
    for (const ticket of tickets) {
      const newTicket = new Ticket({
        eventName: name,
        ticketType: ticket.ticketType,
        price: ticket.price,
        availability: ticket.availability,
        eventId: event._id
      });
      
      await newTicket.save();
    }
    
    res.json(event);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/events/:id
// @desc    Delete an event
// @access  Private
app.delete('/api/events/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check user authorization
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Delete event
    await Event.findByIdAndDelete(req.params.id);
    
    // Delete associated tickets
    await Ticket.deleteMany({ eventId: req.params.id });
    
    res.json({ message: 'Event removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/tickets
// @desc    Get all tickets
// @access  Public
app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ price: 1 });
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
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    res.json(ticket);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/tickets/event/:eventId
// @desc    Get tickets by event ID
// @access  Public
app.get('/api/tickets/event/:eventId', async (req, res) => {
  try {
    const tickets = await Ticket.find({ eventId: req.params.eventId });
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
    const event = eventId ? await Event.findById(eventId) : null;
    
    // Create new ticket
    const newTicket = new Ticket({
      eventName: eventName || (event ? event.name : ''),
      ticketType,
      price,
      availability,
      eventId: eventId || (event ? event._id : null)
    });
    
    const ticket = await newTicket.save();
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
    let ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    // Update ticket
    ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { $set: { availability } },
      { new: true }
    );
    
    // Update ticket in Event document
    const event = await Event.findById(ticket.eventId);
    if (event) {
      const ticketIndex = event.tickets.findIndex(t => t.ticketType === ticket.ticketType);
      if (ticketIndex !== -1) {
        event.tickets[ticketIndex].availability = availability;
        await event.save();
      }
    }
    
    res.json(ticket);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/bookings
// @desc    Get all bookings for current user
// @access  Private
app.get('/api/bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
                              .sort({ bookingDate: -1 });
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
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Verify user owns this booking
    if (booking.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Booking not found' });
    }
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
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    // Check availability
    if (ticket.availability < quantity) {
      return res.status(400).json({ message: 'Not enough tickets available' });
    }
    
    // Create booking
    const newBooking = new Booking({
      userId: req.user.id,
      ticketId,
      eventName: ticket.eventName,
      ticketType: ticket.ticketType,
      quantity,
      price: ticket.price * quantity
    });
    
    // Update ticket availability
    ticket.availability -= quantity;
    await ticket.save();
    
    // Update event ticket availability
    const event = await Event.findById(ticket.eventId);
    if (event) {
      const ticketIndex = event.tickets.findIndex(t => t.ticketType === ticket.ticketType);
      if (ticketIndex !== -1) {
        event.tickets[ticketIndex].availability -= quantity;
        await event.save();
      }
    }
    
    const booking = await newBooking.save();
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
    let booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Verify user owns this booking
    if (booking.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Check if already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }
    
    // Update booking status
    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'cancelled' } },
      { new: true }
    );
    
    // Restore ticket availability
    const ticket = await Ticket.findById(booking.ticketId);
    if (ticket) {
      ticket.availability += booking.quantity;
      await ticket.save();
      
      // Update event ticket availability
      const event = await Event.findById(ticket.eventId);
      if (event) {
        const ticketIndex = event.tickets.findIndex(t => t.ticketType === ticket.ticketType);
        if (ticketIndex !== -1) {
          event.tickets[ticketIndex].availability += booking.quantity;
          await event.save();
        }
      }
    }
    
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(500).send('Server error');
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Event Booking System API');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));