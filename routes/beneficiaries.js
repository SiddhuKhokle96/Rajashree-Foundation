const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Beneficiary, Contact } = require('../models');

// ======================================
// BENEFICIARY MANAGEMENT ROUTES (Protected)
// ======================================

// Add new beneficiary (Authenticated)
router.post('/', auth, async (req, res) => {
  try {
    const { name, age, gender, contact, address, category, notes } = req.body;
    
    const beneficiary = await Beneficiary.create({
      name,
      age,
      gender,
      contact,
      address,
      category,
      notes,
      createdBy: req.user.id
    });

    res.status(201).json(beneficiary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all beneficiaries (Authenticated)
router.get('/', auth, async (req, res) => {
  try {
    const beneficiaries = await Beneficiary.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(beneficiaries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get single beneficiary (Authenticated)
router.get('/:id', auth, async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findByPk(req.params.id);
    if (!beneficiary) {
      return res.status(404).json({ msg: 'Beneficiary not found' });
    }
    res.json(beneficiary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update beneficiary (Authenticated)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, age, gender, contact, address, category, notes } = req.body;
    
    let beneficiary = await Beneficiary.findByPk(req.params.id);
    if (!beneficiary) {
      return res.status(404).json({ msg: 'Beneficiary not found' });
    }

    beneficiary = await beneficiary.update({
      name,
      age,
      gender,
      contact,
      address,
      category,
      notes
    });

    res.json(beneficiary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete beneficiary (Authenticated)
router.delete('/:id', auth, async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findByPk(req.params.id);
    if (!beneficiary) {
      return res.status(404).json({ msg: 'Beneficiary not found' });
    }

    await beneficiary.destroy();
    res.json({ msg: 'Beneficiary removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ======================================
// CONTACT FORM ROUTES (Public)
// ======================================

// Submit contact form (Public)
router.post('/contact', async (req, res) => {
  try {
    const newContact = await Contact.create(req.body);
    res.status(201).json({ 
      success: true,
      message: 'Message sent successfully',
      data: newContact
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ 
      success: false,
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get all contact submissions (Authenticated - for admin)
router.get('/contact/submissions', auth, async (req, res) => {
  try {
    // Add admin check if needed
    // if (req.user.role !== 'admin') return res.status(403).json(...)
    
    const contacts = await Contact.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(contacts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;