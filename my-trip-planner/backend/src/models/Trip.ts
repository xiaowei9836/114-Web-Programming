import mongoose, { Document, Schema } from 'mongoose';

export interface ITrip extends Document {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  destination: string;
  budget: {
    total: number;
    spent: number;
    currency: string;
  };
  itinerary: Array<{
    date: Date;
    activities: Array<{
      title: string;
      description: string;
      location: string;
      time: string;
      cost: number;
    }>;
  }>;
  reminders: Array<{
    title: string;
    description: string;
    dueDate: Date;
    completed: boolean;
  }>;
  journal: Array<{
    date: Date;
    title: string;
    content: string;
    photos: string[];
    mood: 'excellent' | 'good' | 'okay' | 'bad';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const TripSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  budget: {
    total: {
      type: Number,
      default: 0
    },
    spent: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  itinerary: [{
    date: {
      type: Date,
      required: true
    },
    activities: [{
      title: {
        type: String,
        required: true
      },
      description: String,
      location: String,
      time: String,
      cost: {
        type: Number,
        default: 0
      }
    }]
  }],
  reminders: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    dueDate: {
      type: Date,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  journal: [{
    date: {
      type: Date,
      default: Date.now
    },
    title: {
      type: String,
      required: true
    },
    content: String,
    photos: [String],
    mood: {
      type: String,
      enum: ['excellent', 'good', 'okay', 'bad'],
      default: 'good'
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model<ITrip>('Trip', TripSchema);
