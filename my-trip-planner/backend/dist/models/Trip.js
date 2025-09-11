"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const TripSchema = new mongoose_1.Schema({
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
        }],
    // 地圖行程數據
    mapTripData: {
        id: String,
        createdAt: String,
        totalPoints: Number,
        totalEstimatedCost: Number,
        totalEstimatedTime: Number,
        points: [{
                order: Number,
                name: String,
                address: String,
                coordinates: {
                    lat: Number,
                    lng: Number
                },
                estimatedCost: Number,
                estimatedTime: Number,
                notes: String
            }]
    }
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model('Trip', TripSchema);
//# sourceMappingURL=Trip.js.map