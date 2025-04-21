const express = require('express');
const router = express.Router();
const { Donation } = require('../models');
const auth = require('../middleware/auth');

// ======================================
// DONATION MANAGEMENT ROUTES
// ======================================

// Get all donations (Authenticated)
router.get('/', auth, async (req, res) => {
  try {
    const donations = await Donation.findAll({
      order: [['date', 'DESC']]
    });
    res.json(donations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get donation by ID (Authenticated)
router.get('/:id', auth, async (req, res) => {
  try {
    const donation = await Donation.findByPk(req.params.id);
    if (!donation) {
      return res.status(404).json({ msg: 'Donation not found' });
    }
    res.json(donation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Process new donation (Public)
router.post('/', async (req, res) => {
  try {
    const { amount, donorInfo, paymentMethod, donorName, donationType, notes } = req.body;
    
    // Validate input (combined validation from both files)
    if (!amount || !paymentMethod || (!donorInfo && !donorName)) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: amount, paymentMethod, and donor information are required'
      });
    }

    // Create donation record
    const donation = await Donation.create({
      donorName: donorName || donorInfo.name,
      amount,
      donationType: donationType || 'general',
      paymentMethod,
      notes,
      date: new Date(),
      ...(req.user && { recordedBy: req.user.id }) // Add user ID if authenticated
    });

    // Payment processing response (from donate.js)
    const response = {
      success: true,
      message: 'Donation processed successfully',
      donationId: donation.id,
      amount: donation.amount,
      paymentLink: paymentMethod === 'online' 
        ? `https://payment-gateway.com/checkout?amount=${amount}&donationId=${donation.id}`
        : null
    };

    res.status(201).json(response);

  } catch (err) {
    console.error('Donation processing error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Server error processing donation',
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
  }
});

// Update donation (Authenticated)
router.put('/:id', auth, async (req, res) => {
  try {
    const { donorName, amount, donationType, paymentMethod, date, notes } = req.body;
    
    let donation = await Donation.findByPk(req.params.id);
    if (!donation) {
      return res.status(404).json({ msg: 'Donation not found' });
    }

    donation = await donation.update({
      donorName,
      amount,
      donationType,
      paymentMethod,
      date,
      notes
    });

    res.json(donation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete donation (Authenticated)
router.delete('/:id', auth, async (req, res) => {
  try {
    const donation = await Donation.findByPk(req.params.id);
    if (!donation) {
      return res.status(404).json({ msg: 'Donation not found' });
    }

    await donation.destroy();
    res.json({ msg: 'Donation removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ======================================
// SPECIAL PAYMENT ROUTES
// ======================================

// Handle payment success callback (Public)
router.get('/success/:donationId', async (req, res) => {
  try {
    const donation = await Donation.findByPk(req.params.donationId);
    if (!donation) {
      return res.status(404).json({ success: false, error: 'Donation not found' });
    }

    // Update payment status
    await donation.update({ status: 'completed' });

    res.json({ 
      success: true,
      message: 'Payment confirmed successfully',
      donation
    });
  } catch (err) {
    console.error('Payment confirmation error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error confirming payment'
    });
  }
});

// Handle payment failure callback (Public)
router.get('/failed/:donationId', async (req, res) => {
  try {
    const donation = await Donation.findByPk(req.params.donationId);
    if (!donation) {
      return res.status(404).json({ success: false, error: 'Donation not found' });
    }

    // Update payment status
    await donation.update({ status: 'failed' });

    res.json({ 
      success: false,
      message: 'Payment failed',
      donation
    });
  } catch (err) {
    console.error('Payment failure error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error processing payment failure'
    });
  }
});

module.exports = router;