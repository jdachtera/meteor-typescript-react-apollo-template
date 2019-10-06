import { Collection, ObjectID, Db, ObjectId, FilterQuery } from "mongodb";
declare var MongoInternals: { defaultRemoteCollectionDriver: () => { mongo: { db: Db } } };

export const getMongoConnection = async () => {
    const {
        mongo: { db },
    } = MongoInternals.defaultRemoteCollectionDriver();

    return db;
};

export const getCollection = async <TSchema>(name: string, options = {}): Promise<Collection<TSchema>> => {
    const mongo = await getMongoConnection();

    try {
        const collection: Collection<TSchema> = await new Promise((resolve, reject) =>
            mongo.collection<TSchema>(name, { ...options, strict: true }, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }),
        );
        return collection;
    } catch (e) {
        const collection: Collection<TSchema> = await new Promise((resolve, reject) =>
            mongo.createCollection<TSchema>(name, { ...options, strict: true }, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }),
        );

        return collection;
    }
};

export const insertOne = async <T>(collectionName, data: T): Promise<T & { _id: ObjectID }> => {
    const collection = await getCollection<T>(collectionName);

    const {
        result: { ok },
        ops: [insertedItem],
    } = await collection.insertOne(data);

    if (!ok) {
        throw new Error(`Could not insert item into ${collectionName}`);
    }

    return insertedItem;
};

export const updateOne = async <T>(collectionName, filter: FilterQuery<T>, data: T, projection): Promise<T> => {
    const collection = await getCollection<T>(collectionName);

    console.log(filter);

    const {
        ok,
        value,
        lastErrorObject: { n },
    } = await collection.findOneAndUpdate(filter, { $set: data }, { returnOriginal: false, projection });

    if (!ok) {
        throw new Error(`Could not update item in ${collectionName}`);
    }

    if (!n) {
        throw new Error(`Item  not found in ${collectionName}`);
    }

    return value;
};

export const deleteOne = async <T>(collectionName, filter: FilterQuery<T>) => {
    const collection = await getCollection(collectionName);

    const { deletedCount } = await collection.deleteOne(filter);

    if (!deletedCount) {
        throw new Error(`Item not found in ${collectionName}`);
    }
};

export const find = async <TSchema>(collectionName, query, projection) => {
    const collection = await getCollection<TSchema>(collectionName);

    return collection.find(query, { projection }).toArray();
};

export const findOne = async <TSchema>(collectionName, filter, projection) => {
    const collection = await getCollection<TSchema>(collectionName);

    return collection.findOne(filter, { projection });
};
