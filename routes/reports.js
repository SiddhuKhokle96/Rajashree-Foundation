const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Sequelize } = require('sequelize');
const Donation = require('../models/Donation');
const Beneficiary = require('../models/Beneficiary');
const Event = require('../models/Event');

// Get summary statistics
router.get('/summary', auth, async (req, res) => {
  try {
    // Donation statistics
    const donationStats = await Donation.findOne({
      attributes: [
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalDonations'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('AVG', Sequelize.col('amount')), 'avgDonation']
      ],
      raw: true
    });
    
    // Beneficiary statistics
    const beneficiaryStats = await Beneficiary.findOne({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalBeneficiaries']
      ],
      raw: true
    });
    
    const beneficiariesByCategory = await Beneficiary.findAll({
      attributes: [
        'category',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['category'],
      raw: true
    });
    
    // Event statistics
    const eventStats = await Event.findOne({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalEvents']
      ],
      raw: true
    });
    
    const upcomingEvents = await Event.count({
      where: {
        date: { [Sequelize.Op.gt]: new Date() }
      }
    });
    
    res.json({
      donations: donationStats || {},
      beneficiaries: {
        ...beneficiaryStats,
        byCategory: beneficiariesByCategory
      },
      events: {
        ...eventStats,
        upcomingEvents
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get donation trends
router.get('/donations/trends', auth, async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    
    let format;
    if (period === 'daily') {
      format = '%Y-%m-%d';
    } else if (period === 'monthly') {
      format = '%Y-%m';
    } else {
      format = '%Y';
    }
    
    const trends = await Donation.findAll({
      attributes: [
        [Sequelize.fn('DATE_FORMAT', Sequelize.col('date'), format), 'period'],
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['period'],
      order: [[Sequelize.fn('DATE_FORMAT', Sequelize.col('date'), format), 'ASC']],
      raw: true
    });
    
    res.json(trends);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;