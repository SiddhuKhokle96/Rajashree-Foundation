const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Event = require('../models/Event');
const User = require('../models/User');

// Create event
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, date, location, volunteersRequired, budget } = req.body;
    
    const event = await Event.create({
      title,
      description,
      date,
      location,
      volunteersRequired,
      budget,
      organizer: req.user.id
    });

    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all events
router.get('/', auth, async (req, res) => {
  try {
    const events = await Event.findAll({
      order: [['date', 'DESC']],
      include: [{
        model: User,
        as: 'organizerDetails',
        attributes: ['name', 'email']
      }]
    });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get event by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'organizerDetails',
        attributes: ['name', 'email']
      }]
    });
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update event
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, date, location, volunteersRequired, budget, status } = req.body;
    
    let event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    event = await event.update({
      title,
      description,
      date,
      location,
      volunteersRequired,
      budget,
      status
    });

    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete event
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    await event.destroy();
    res.json({ msg: 'Event removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;