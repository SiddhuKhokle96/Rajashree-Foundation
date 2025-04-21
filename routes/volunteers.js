const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Volunteer = require('../models/Volunteer');
const User = require('../models/User');

// Register volunteer
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, phone, skills, availability, interests } = req.body;
    
    const volunteer = await Volunteer.create({
      name,
      email,
      phone,
      skills,
      availability,
      interests,
      registeredBy: req.user.id
    });

    res.json(volunteer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all volunteers
router.get('/', auth, async (req, res) => {
  try {
    const volunteers = await Volunteer.findAll({
      order: [['name', 'ASC']],
      include: [{
        model: User,
        as: 'registeredByDetails',
        attributes: ['name', 'email']
      }]
    });
    res.json(volunteers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get volunteer by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const volunteer = await Volunteer.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'registeredByDetails',
        attributes: ['name', 'email']
      }]
    });
    
    if (!volunteer) {
      return res.status(404).json({ msg: 'Volunteer not found' });
    }
    res.json(volunteer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update volunteer
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email, phone, skills, availability, interests, status } = req.body;
    
    let volunteer = await Volunteer.findByPk(req.params.id);
    if (!volunteer) {
      return res.status(404).json({ msg: 'Volunteer not found' });
    }

    volunteer = await volunteer.update({
      name,
      email,
      phone,
      skills,
      availability,
      interests,
      status
    });

    res.json(volunteer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete volunteer
router.delete('/:id', auth, async (req, res) => {
  try {
    const volunteer = await Volunteer.findByPk(req.params.id);
    if (!volunteer) {
      return res.status(404).json({ msg: 'Volunteer not found' });
    }

    await volunteer.destroy();
    res.json({ msg: 'Volunteer removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;