const mongodb = require('mongodb')

const { ObjectId } = mongodb

const createCurrencies = [
    {
        _id: new ObjectId('000000000000000000000000'),
        name: 'Pesos Argentinos',
        acronym: 'ARS',
        symbols: '$',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        _id: new ObjectId('000000000000000000000001'),
        name: 'Dolares Americanos',
        acronym: 'USD',
        symbols: 'U$S',
        createdAt: new Date(),
        updatedAt: new Date(),
    }
];

export const up = async (db, client) => {
    await db.collection('currencies').insertMany(createCurrencies);
};

export const down = async (db, client) => {
    await db.collection('currencies').deleteMany({
        _id: {
            $in: createCurrencies.map((currency) => currency._id),
        },
    })
};
