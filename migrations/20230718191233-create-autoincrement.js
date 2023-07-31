import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

const createAutoIncrements = [
    {
        _id: new ObjectId("000000000000000000000000"),
        model: "Customer",
        field: "number",
        next: 3
    }
];

export const up = async (db, client) => {
    await db.collection('autoincrements').insertMany(createAutoIncrements);
};

export const down = async (db, client) => {
    await db.collection('autoincrements').deleteMany({
        _id: {
            $in: createAutoIncrements.map((role) => role._id),
        },
    })
};