const mongodb = require('mongodb')

const { ObjectId } = mongodb

const createCustomers = [
    {
        _id: new ObjectId('000000000000000000000000'),
        number: 1,
        type: 'PC',
        user: new ObjectId('000000000000000000000002'),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        _id: new ObjectId('000000000000000000000001'),
        number: 1,
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
    await db.collection('currencies').deleteMany({
        _id: {
            $in: createCustomers.map((currency) => currency._id),
        },
    })
};
