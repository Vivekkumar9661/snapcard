const mongoose = require('mongoose');
const fs = require('fs');

async function check() {
    try {
        console.log('--- START DIAGNOSTICS ---');
        const env = fs.readFileSync('.env.local', 'utf8');
        const match = env.match(/MONGODB_URL=(.*)/);
        const url = match ? match[1].trim() : null;

        if (!url) {
            console.log('Error: URL not found');
            process.exit(1);
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(url);
        console.log('Connected successfully.');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('Collections in DB:', collections.map(c => c.name));

        const myUserIdStr = "69653e4c32755ef9bd5e6f5d";
        const myUserId = new mongoose.Types.ObjectId(myUserIdStr);
        console.log('Searching for User ID:', myUserIdStr);

        // Check if user exists
        const usersCol = db.collection('users');
        const user = await usersCol.findOne({ _id: myUserId });
        if (user) {
            console.log('User found:', user.name, 'Role:', user.role);
        } else {
            console.log('User NOT found with ObjectId. Trying as string...');
            const userStr = await usersCol.findOne({ _id: myUserIdStr });
            if (userStr) console.log('User found with STRING ID! This is a problem.');
            else console.log('User not found in DB at all.');
        }

        // Check Assignments
        const assignmentsCol = db.collection('deliveryassignments');
        const allAssignments = await assignmentsCol.find({}).toArray();
        console.log('Total Assignments found:', allAssignments.length);

        allAssignments.forEach((a, i) => {
            console.log(`Assignment ${i + 1}:`);
            console.log(`  ID: ${a._id}`);
            console.log(`  Status: ${a.status}`);
            console.log(`  BroadcastedTo: ${JSON.stringify(a.broadcastedTo || a.brodcastedTo)}`);
            console.log(`  AssignedTo: ${a.assignedTo}`);

            // Test match
            const bTo = a.broadcastedTo || a.brodcastedTo || [];
            const isMatch = bTo.some(id => id.toString() === myUserIdStr);
            console.log(`  Does it match current user? ${isMatch}`);
        });

        console.log('--- END DIAGNOSTICS ---');
        process.exit(0);
    } catch (e) {
        console.log('DIAGNOSTICS FAILED:', e.message);
        process.exit(1);
    }
}
check();
