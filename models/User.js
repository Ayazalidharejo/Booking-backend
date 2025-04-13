// File: models/User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
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

module.exports = mongoose.model('User', UserSchema);

// File: models/Event.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema({
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
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', EventSchema);

// File: models/Ticket.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TicketSchema = new Schema({
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
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  }
});

module.exports = mongoose.model('Ticket', TicketSchema);

// File: models/Booking.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ticketId: {
    type: Schema.Types.ObjectId,
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

module.exports = mongoose.model('Booking', BookingSchema);