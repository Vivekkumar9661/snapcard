const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function run() {
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        await client.connect();
        const db = client.db(); // uses db from connection string
        const collection = db.collection('deliveryassignments');

        const count = await collection.countDocuments();
        const all = await collection.find({}).toArray();

        console.log('--- DB DEBUG ---');
        console.log('Total documents in deliveryassignments:', count);
        if (all.length > 0) {
            all.forEach(doc => {
                console.log('Doc ID:', doc._id);
                console.log('  Status:', doc.status);
                console.log('  BroadcastedTo:', doc.broadcastedTo || doc.brodcastedTo);
                console.log('  AssignedTo:', doc.assignedTo);
            });
        } else {
            console.log('NO DOCUMENTS FOUND IN COLLECTION "deliveryassignments"');
            // Try to list all collections to see if the name is different
            const collections = await db.listCollections().toArray();
            console.log('Available collections:', collections.map(c => c.name));
        }
        console.log('--- END DEBUG ---');
    } catch (e) {
        console.error('ERROR:', e);
    } finally {
        await client.close();
    }
}

run();
