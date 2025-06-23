const mongoose = require('mongoose');

const competitionSchema = new mongoose.Schema({
  user_id:{
    type:String,
    required:true
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
