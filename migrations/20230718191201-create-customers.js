import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

const createCustomers = [
    {
        _id: new ObjectId('000000000000000000000000'),
        number: 1,
        type: 'BC',
        user: new ObjectId('000000000000000000000000'),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        _id: new ObjectId('000000000000000000000001'),
        number: 2,
        type: 'PC',
        user: new ObjectId('000000000000000000000002'),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        _id: new ObjectId('000000000000000000000002'),
        number: 3,
        type: 'BC',
        user: new ObjectId('000000000000000000000003'),
        createdAt: new Date(),
        updatedAt: new Date(),
    }
];

export const up = async (db, client) => {
    await db.collection('customers').insertMany(createCustomers);
};

export const down = async (db, client) => {
    await db.collection('customers').deleteMany({
        _id: {
            $in: createCustomers.map((currency) => currency._id),
        },
    })
};
