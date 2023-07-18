const mongodb = require('mongodb')

const { ObjectId } = mongodb

const createAccounts = [
    {
        _id: new ObjectId('000000000000000000000000'),
        accountId: '9990001801297793098475',
        type: 'CA',
        alias: 'ANA.MARIA.GOM.CA.ARG',
        accountHolder: new ObjectId('000000000000000000000002'),
        accountBalance: 10000,
        currency: new ObjectId('000000000000000000000000'),
        operations: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        _id: new ObjectId('000000000000000000000001'),
        accountId: '9990001802887691608818',
        type: 'CC',
        alias: 'ANA.MARIA.GOM.CC.ARG',
        accountHolder: new ObjectId('000000000000000000000002'),
        accountBalance: 20000,
        currency: new ObjectId('000000000000000000000000'),
        operations: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        _id: new ObjectId('000000000000000000000002'),
        accountId: '9990001801324586218713',
        type: 'CA',
        alias: 'ANA.MARIA.GOM.CA.USD',
        accountHolder: new ObjectId('000000000000000000000002'),
        accountBalance: 5000,
        currency: new ObjectId('000000000000000000000001'),
        operations: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    }
];

export const up = async (db, client) => {
    await db.collection('accounts').insertMany(createAccounts);
};

export const down = async (db, client) => {
    await db.collection('accounts').deleteMany({
        _id: {
            $in: createAccounts.map((role) => role._id),
        },
    })
};
