const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function run() {
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        await client.connect();
        const db = client.db();
        console.log('--- DATABASE DEBUG ---');
        console.log('Connected to:', db.databaseName);

        const collections = await db.listCollections().toArray();
        const colNames = collections.map(c => c.name);
        console.log('Collections:', colNames);

        // 1. Check Delivery Assignments
        const assignmentColName = colNames.find(n => n.toLowerCase().includes('deliveryassignment')) || 'deliveryassignments';
        console.log('Using assignment collection:', assignmentColName);
        const assignments = await db.collection(assignmentColName).find({}).toArray();
        console.log(`Found ${assignments.length} assignments.`);
        assignments.forEach(a => {
            console.log(`[Assignment] ID: ${a._id}, Status: ${a.status}, BroadcastedTo: ${JSON.stringify(a.broadcastedTo || a.brodcastedTo)}, AssignedTo: ${a.assignedTo}`);
        });

        // 2. Check Delivery Boys
        const userColName = colNames.find(n => n.toLowerCase() === 'users') || 'users';
        const deliveryBoys = await db.collection(userColName).find({ role: 'deliveryBoy' }).toArray();
        console.log(`Found ${deliveryBoys.length} delivery boys.`);
        deliveryBoys.forEach(b => {
            console.log(`[User] ID: ${b._id}, Name: ${b.name}, Role: ${b.role}`);
        });

        console.log('--- END DEBUG ---');
    } catch (e) {
        console.error('DEBUG ERROR:', e);
    } finally {
        await client.close();
    }
}

run();
