const mongoose = require('mongoose');
const fs = require('fs');

async function check() {
    const results = {
        timestamp: new Date().toISOString(),
        collections: [],
        user: null,
        assignments: [],
        error: null
    };

    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const match = env.match(/MONGODB_URL=(.*)/);
        const url = match ? match[1].trim() : null;

        await mongoose.connect(url);
        const db = mongoose.connection.db;

        const collections = await db.listCollections().toArray();
        results.collections = collections.map(c => c.name);

        const myUserIdStr = "69653e4c32755ef9bd5e6f5d";
        const myUserId = new mongoose.Types.ObjectId(myUserIdStr);

        const usersCol = db.collection('users');
        results.user = await usersCol.findOne({ _id: myUserId });

        const assignmentsCol = db.collection('deliveryassignments');
        const all = await assignmentsCol.find({}).toArray();
        results.assignments = all.map(a => ({
            id: a._id.toString(),
            status: a.status,
            broadcastedTo: (a.broadcastedTo || a.brodcastedTo || []).map(id => id.toString()),
            assignedTo: a.assignedTo ? a.assignedTo.toString() : null,
            matchesUser: (a.broadcastedTo || a.brodcastedTo || []).some(id => id.toString() === myUserIdStr) || (a.assignedTo && a.assignedTo.toString() === myUserIdStr)
        }));

    } catch (e) {
        results.error = e.message;
    } finally {
        fs.writeFileSync('diag_results.json', JSON.stringify(results, null, 2));
        process.exit(0);
    }
}
check();
