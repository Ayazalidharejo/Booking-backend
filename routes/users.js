// File: routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST api/users/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
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
      process.env.JWT_SECRET || 'mysecretkey',
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
router.post('/login', async (req, res) => {
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
      process.env.JWT_SECRET || 'mysecretkey',
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
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

// File: routes/events.js
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const auth = require('../middleware/auth');

// @route   GET api/events
// @desc    Get all events
// @access  Public
router.get('/', async (req, res) => {
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
router.get('/:id', async (req, res) => {
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
router.post('/', auth, async (req, res) => {
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
router.put('/:id', auth, async (req, res) => {
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
router.delete('/:id', auth, async (req, res) => {
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
    await event.remove();
    
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

module.exports = router;

// File: routes/tickets.js
const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// @route   GET api/tickets
// @desc    Get all tickets
// @access  Public
router.get('/', async (req, res) => {
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
router.get('/:id', async (req, res) => {
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
router.get('/event/:eventId', async (req, res) => {
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
router.post('/', auth, async (req, res) => {
  const { eventName, ticketType, price, availability, eventId } = req.body;

  try {
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event && eventId) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Create new ticket
    const newTicket = new Ticket({
      eventName: eventName || event.name,
      ticketType,
      price,
      availability,
      eventId: eventId || event._id
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
router.put('/:id', auth, async (req, res) => {
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

module.exports = router;

// File: routes/bookings.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// @route   GET api/bookings
// @desc    Get all bookings for current user
// @access  Private
router.get('/', auth, async (req, res) => {
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
router.get('/:id', auth, async (req, res) => {
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
router.post('/', auth, async (req, res) => {
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
router.patch('/:id/cancel', auth, async (req, res) => {
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

module.exports = router;