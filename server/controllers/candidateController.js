
const Candidate = require('../models/Candidate');

exports.createCandidate = async (req, res) => {
  const { name, email } = req.body;

  try {
    let candidate = await Candidate.findOne({ email });
    if (candidate) {
      return res.status(400).json({ msg: 'Candidate already exists' });
    }

    candidate = new Candidate({
      name,
      email,
    });

    await candidate.save();
    res.json(candidate);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.json(candidates);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
