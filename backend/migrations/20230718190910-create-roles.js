const mongodb = require('mongodb')

const { ObjectId } = mongodb

const createRoles = [
    {
        _id: new ObjectId('000000000000000000000000'),
        name: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        _id: new ObjectId('000000000000000000000001'),
        name: 'empleado',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        _id: new ObjectId('000000000000000000000002'),
        name: 'cliente',
        createdAt: new Date(),
        updatedAt: new Date(),
    }
];

export const up = async (db, client) => {
    await db.collection('roles').insertMany(createRoles);
};

export const down = async (db, client) => {
    await db.collection('roles').deleteMany({
        _id: {
            $in: createRoles.map((role) => role._id),
        },
    })
};
