const mongoose = require('mongoose');

const competitionSchema = new mongoose.Schema({
  user_id:{
    type:String,
    required:true
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the OrganisationRegister model
    ref: 'OrganisationRegister', // Model name for the organiser
    required: true // Make it required to ensure every competition is linked to an organiser
  },
  overview: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String,
      required: true
    },
    description: {
      type: String,
      trim: true
    },
    stages: [{
      type: Object
    }]
  },

  syllabus: {
    topics: [{
      type: Object
    }]
  },

  pattern: {
    sections: [{
     type: Object
    }]
  },

  eligibility: [{
    type: Object
  }],
  StudentInformation:{
    StudentDetails: [{
      type: String
    }],
    SchoolDetails: [{
      type: String
    }]
  },

  registration: {
    registration_type: {
        type:Object
    },
    plans: [
        {type:Object}
    ]
  },

  awards: [{
   type:Object 
  }],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Competition', competitionSchema);
