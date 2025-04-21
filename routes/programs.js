const express = require('express');
const router = express.Router();
const { Program } = require('../models');
const auth = require('../middleware/auth');

// ======================================
// PUBLIC PROGRAM ROUTES (from explore.js)
// ======================================

// Get all active programs (Public)
router.get('/', async (req, res) => {
  try {
    const programs = await Program.findAll({
      where: { status: 'active' },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'title', 'description', 'image', 'slug']
    });
    res.json(programs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get featured programs (Public)
router.get('/featured', async (req, res) => {
  try {
    const programs = await Program.findAll({
      where: { 
        status: 'active',
        isFeatured: true 
      },
      limit: 3,
      order: [['createdAt', 'DESC']]
    });
    res.json(programs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get program by slug (Public)
router.get('/:slug', async (req, res) => {
  try {
    const program = await Program.findOne({
      where: { slug: req.params.slug }
    });
    
    if (!program) {
      return res.status(404).json({ msg: 'Program not found' });
    }
    
    res.json(program);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ======================================
// ADMIN PROGRAM ROUTES (from programs.js)
// ======================================

// Create new program (Authenticated)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, content, image, status, isFeatured } = req.body;
    
    const program = await Program.create({
      title,
      description,
      content,
      image,
      status: status || 'draft',
      isFeatured: isFeatured || false,
      createdBy: req.user.id
    });

    res.status(201).json(program);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update program (Authenticated)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, content, image, status, isFeatured } = req.body;
    
    let program = await Program.findByPk(req.params.id);
    if (!program) {
      return res.status(404).json({ msg: 'Program not found' });
    }

    program = await program.update({
      title,
      description,
      content,
      image,
      status,
      isFeatured
    });

    res.json(program);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete program (Authenticated)
router.delete('/:id', auth, async (req, res) => {
  try {
    const program = await Program.findByPk(req.params.id);
    if (!program) {
      return res.status(404).json({ msg: 'Program not found' });
    }

    await program.destroy();
    res.json({ msg: 'Program removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all programs for admin (Authenticated)
router.get('/admin/all', auth, async (req, res) => {
  try {
    const programs = await Program.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(programs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;