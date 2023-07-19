import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

const createUsers = [
    {
        _id: new ObjectId('000000000000000000000000'),
        userName: 'admin',
        email: 'admin@bancoinsptutn.com.ar',
        password: '$2a$10$OLb1CwJaw56Vq8unFQXxPOUIK6ldsVl8DHcd6gm4OutnSrUwxRDge',
        role: new ObjectId('000000000000000000000000'),
        lastName: 'Banco INSPT-UTN',
        firstName: 'Admin',
        phone: '1112345678',
        governmentId: {
            type: 'cuil',
            number: '20123456789'
        },
        bornDate: new Date(1992, 4, 15),
        isActive: true,
        isPasswordResetRequired: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
        loginAttempts: 0
    },
    {
        _id: new ObjectId('000000000000000000000001'),
        userName: 'jperez',
        email: 'jperez@bancoinsptutn.com.ar',
        password: '$2a$10$OLb1CwJaw56Vq8unFQXxPOUIK6ldsVl8DHcd6gm4OutnSrUwxRDge',
        role: new ObjectId('000000000000000000000001'),
        lastName: 'Perez',
        firstName: 'Juan',
        phone: '1198765432',
        governmentId: {
            type: 'cuil',
            number: '20342114335'
        },
        bornDate: new Date(1988, 3, 25),
        isActive: true,
        isPasswordResetRequired: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
        loginAttempts: 0
    },
    {
        _id: new ObjectId('000000000000000000000002'),
        userName: '27280335148',
        email: 'anamariagomez@gmail.com',
        password: '$2a$10$pczNfQD4Xwya.E.lrpzXeuJXwWBhMHwcGCEO.42RAFPHsmiUsor4u',
        role: new ObjectId('000000000000000000000002'),
        lastName: 'Gomez',
        firstName: 'Ana Maria',
        phone: '1198765432',
        governmentId: {
            type: 'cuil',
            number: '27280335148'
        },
        bornDate: new Date(1955, 5, 14),
        isActive: true,
        isPasswordResetRequired: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
        loginAttempts: 0
    },
    {
        _id: new ObjectId('000000000000000000000003'),
        userName: '30715925083',
        email: 'empresa@anonima.com.ar',
        password: '$2a$10$8nyYPJ0WuP0i84/wRQi6UuwjyK0x7f/krFPvBSvmqKQGtwzAr.ON2',
        role: new ObjectId('000000000000000000000002'),
        lastName: 'Empresa Anonima S.A.',
        firstName: 'Empresa Anonima S.A.',
        phone: '1145623789',
        governmentId: {
            type: 'cuil',
            number: '30715925083'
        },
        bornDate: new Date(1980, 1, 1),
        isActive: true,
        isPasswordResetRequired: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
        loginAttempts: 0
    }
];

export const up = async (db, client) => {
    await db.collection('users').insertMany(createUsers);
};

export const down = async (db, client) => {
    await db.collection('users').deleteMany({
        _id: {
            $in: createUsers.map((user) => user._id),
        },
    })
};
