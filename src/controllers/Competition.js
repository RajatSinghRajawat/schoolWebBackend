const Competition = require('../models/Competition');
const fs = require('fs');
const path = require('path');

// Overview Controllers
exports.createOverview = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Image is required' });
        }

        const imageUrl = `/uploads/competitions/${req.file.filename}`;
        
        // Parse stages if it's a string (from form-data)
        let stages = req.body.stages;
        if (typeof stages === 'string') {
            try {
                stages = JSON.parse(stages);
            } catch (error) {
                return res.status(400).json({ message: 'Invalid stages format' });
            }
        }

        const competition = new Competition({
            user_id: req.body.user_id,
            overview: {
                name: req.body.name,
                image: imageUrl,
                description: req.body.description,
                stages: stages
            }
        });

        await competition.save();
        res.status(201).json(competition);
    } catch (error) {
        // If there's an error, delete the uploaded file
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        res.status(400).json({ message: error.message });
    }
};

exports.getOverview = async (req, res) => {
    try {
        const competition = await Competition.findById(req.params.id);
        if (!competition) {
            return res.status(404).json({ message: 'Competition not found' });
        }
        res.json(competition);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateOverview = async (req, res) => {
    try {
        const competition = await Competition.findById(req.params.id);
        if (!competition) {
            return res.status(404).json({ message: 'Competition not found' });
        }

        // Parse stages if it's a string (from form-data)
        let stages = req.body.stages;
        if (typeof stages === 'string') {
            try {
                stages = JSON.parse(stages);
            } catch (error) {
                return res.status(400).json({ message: 'Invalid stages format' });
            }
        }

        const updateData = {
            overview: {
                name: req.body.name,
                description: req.body.description,
                stages: stages
            }
        };

        // If new image is uploaded
        if (req.file) {
            // Delete old image if exists
            if (competition.overview.image) {
                const oldImagePath = path.join(__dirname, '../../', competition.overview.image);
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.error('Error deleting old image:', err);
                });
            }
            updateData.overview.image = `/uploads/competitions/${req.file.filename}`;
        }

        const updatedCompetition = await Competition.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        res.json(updatedCompetition.overview);
    } catch (error) {
        // If there's an error and a new file was uploaded, delete it
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        res.status(400).json({ message: error.message });
    }
};

// Syllabus Controllers
exports.createSyllabus = async (req, res) => {
    try {
        const competition = await Competition.findById(req.params.id);
        if (!competition) return res.status(404).json({ message: 'Competition not found' });
        competition.syllabus = req.body;
        await competition.save();
        res.status(201).json(competition.syllabus);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getSyllabus = async (req, res) => {
    try {
        const competition = await Competition.findById(req.params.id);
        if (!competition) return res.status(404).json({ message: 'Competition not found' });
        res.json(competition.syllabus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateSyllabus = async (req, res) => {
    try {
        const competition = await Competition.findByIdAndUpdate(
            req.params.id,
            { syllabus: req.body },
            { new: true }
        );
        if (!competition) return res.status(404).json({ message: 'Competition not found' });
        res.json(competition.syllabus);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Pattern Controllers
exports.createPattern = async (req, res) => {
    try {
        const competition = await Competition.findById(req.params.id);
        if (!competition) return res.status(404).json({ message: 'Competition not found' });
        competition.pattern = req.body;
        await competition.save();
        res.status(201).json(competition.pattern);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getPattern = async (req, res) => {
    try {
        const competition = await Competition.findById(req.params.id);
        if (!competition) return res.status(404).json({ message: 'Competition not found' });
        res.json(competition.pattern);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updatePattern = async (req, res) => {
    try {
        const competition = await Competition.findByIdAndUpdate(
            req.params.id,
            { pattern: req.body },
            { new: true }
        );
        if (!competition) return res.status(404).json({ message: 'Competition not found' });
        res.json(competition.pattern);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Eligibility Controllers
exports.createEligibility = async (req, res) => {
    try {
        const competition = await Competition.findById(req.params.id);
        if (!competition) return res.status(404).json({ message: 'Competition not found' });
        // StudentInformation bhi add karna hai
        competition.StudentInformation = req.body.StudentInformation;
        competition.eligibility = req.body.eligibility;
        await competition.save();
        res.status(201).json(competition);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getEligibility = async (req, res) => {
    try {
        const competition = await Competition.findById(req.params.id);
        if (!competition) return res.status(404).json({ message: 'Competition not found' });
        res.json(competition);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateEligibility = async (req, res) => {
    try {
        const competition = await Competition.findByIdAndUpdate(
            req.params.id,
            { eligibility: req.body },
            { new: true }
        );
        if (!competition) return res.status(404).json({ message: 'Competition not found' });
        res.json(competition.eligibility);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Registration Controllers
exports.createRegistration = async (req, res) => {
    try {
        const competition = await Competition.findById(req.params.id);
        if (!competition) return res.status(404).json({ message: 'Competition not found' });
        competition.registration = req.body;
        await competition.save();
        res.status(201).json(competition.registration);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getRegistration = async (req, res) => {
    try {
        const competition = await Competition.findById(req.params.id);
        if (!competition) return res.status(404).json({ message: 'Competition not found' });
        res.json(competition.registration);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateRegistration = async (req, res) => {
    try {
        const competition = await Competition.findByIdAndUpdate(
            req.params.id,
            { registration: req.body },
            { new: true }
        );
        if (!competition) return res.status(404).json({ message: 'Competition not found' });
        res.json(competition.registration);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Awards Controllers
exports.createAwards = async (req, res) => {
    try {
        const competition = await Competition.findById(req.params.id);
        if (!competition) return res.status(404).json({ message: 'Competition not found' });
        competition.awards = req.body;
        await competition.save();
        res.status(201).json(competition.awards);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getAwards = async (req, res) => {
    try {
        const competition = await Competition.findById(req.params.id);
        if (!competition) return res.status(404).json({ message: 'Competition not found' });
        res.json(competition.awards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateAwards = async (req, res) => {
    try {
        const competition = await Competition.findByIdAndUpdate(
            req.params.id,
            { awards: req.body },
            { new: true }
        );
        if (!competition) return res.status(404).json({ message: 'Competition not found' });
        res.json(competition.awards);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};



// all competitions
exports.getAllCompetitions = async (req, res) => {
    try {
        const competitions = await Competition.find({});
        res.json(competitions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
