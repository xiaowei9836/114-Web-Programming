import mongoose, { Document } from 'mongoose';
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
    mapTripData?: {
        id: string;
        createdAt: string;
        totalPoints: number;
        totalEstimatedCost: number;
        totalEstimatedTime: number;
        points: Array<{
            order: number;
            name: string;
            address: string;
            coordinates: {
                lat: number;
                lng: number;
            };
            estimatedCost?: number;
            estimatedTime?: number;
            notes?: string;
        }>;
    };
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ITrip, {}, {}, {}, mongoose.Document<unknown, {}, ITrip, {}, {}> & ITrip & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Trip.d.ts.map