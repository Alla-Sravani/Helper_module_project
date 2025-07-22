const multer = require('multer');
const path = require('path');

// Ensure directories: uploads/photos and uploads/kyc

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = file.fieldname === 'photo' ? 'uploads/photos' : 'uploads/kyc';
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = file.fieldname + '-' + Date.now() + ext;
    cb(null, name);
  }
});

const upload = multer({ storage });


// POST: Create helper with photo and KYC
router.post('/', upload.fields([{ name: 'photo' }, { name: 'kyc' }]), async (req, res) => {
  try {
    const photoPath = req.files?.photo?.[0]?.path || '';
    const kycPath = req.files?.kyc?.[0]?.path || '';

    const newHelper = new Helper({
      ...req.body,
      fullName: req.body.fullName?.trim(),
      vehicleType: req.body.vehicleType?.trim(),
      photoUrl: photoPath,
      kycDocumentUrl: kycPath,
      languages: JSON.parse(req.body.languages)
    });

    const saved = await newHelper.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});


// GET: Search and Sort Helpers
router.get('/', async (req, res) => {
  try {
    const { search = '', sortBy = 'fullName', order = 'asc' } = req.query;

    const query = {
      $or: [
        { fullName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { serviceType: { $regex: search, $options: 'i' } }
      ]
    };

    const sortDirection = order === 'asc' ? 1 : -1;
    const helpers = await Helper.find(query).sort({ [sortBy]: sortDirection });

    res.json(helpers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch helpers' });
  }
});


// GET: Single helper by ID
router.get('/:id', async (req, res) => {
  try {
    const helper = await Helper.findById(req.params.id);
    if (!helper) return res.status(404).json({ error: 'Helper not found' });
    res.json(helper);
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID' });
  }
});


// PUT: Update helper details (with optional new photo/KYC)
router.put('/:id', upload.fields([{ name: 'photo' }, { name: 'kyc' }]), async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      fullName: req.body.fullName?.trim(),
      vehicleType: req.body.vehicleType?.trim()
    };

    if (req.files?.photo) updateData.photoUrl = req.files.photo[0].path;
    if (req.files?.kyc) updateData.kycDocumentUrl = req.files.kyc[0].path;
    if (req.body.languages) updateData.languages = JSON.parse(req.body.languages);

    const updated = await Helper.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    if (!updated) return res.status(404).json({ error: 'Helper not found' });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE: Remove helper by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Helper.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Helper not found' });
    res.json({ message: 'Helper deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID' });
  }
});


module.exports = router;
