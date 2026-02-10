const mongoose = require('mongoose');
const fs = require('fs');

async function check() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const match = env.match(/MONGODB_URL=(.*)/);
        const url = match ? match[1].trim() : null;

        if (!url) {
            console.error('URL not found in .env.local');
            process.exit(1);
        }

        await mongoose.connect(url);
        const col = mongoose.connection.db.collection('users');

        // Let's find any delivery boy
        const boy = await col.findOne({ role: 'deliveryBoy' });
        console.log('Sample Delivery Boy:', JSON.stringify(boy, null, 2));

        const myId = "69653e4c32755ef9bd5e6f5d";
        const me = await col.findOne({ _id: new mongoose.Types.ObjectId(myId) });
        console.log('Current User Data:', JSON.stringify(me, null, 2));

        const assignmentsCol = mongoose.connection.db.collection('deliveryassignments');
        const assignments = await assignmentsCol.find({}).toArray();
        console.log('Total Assignments:', assignments.length);
        assignments.forEach(a => {
            console.log(`- ID: ${a._id}, Status: ${a.status}, BroadcastedTo: ${JSON.stringify(a.broadcastedTo || a.brodcastedTo)}`);
        });

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
