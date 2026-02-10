const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        const coll = mongoose.connection.db.collection('deliveryassignments');
        const count = await coll.countDocuments();
        const all = await coll.find({}).toArray();
        console.log('Total Assignments:', count);
        console.log('Sample IDs and Statuses:');
        all.slice(0, 5).forEach(a => console.log(`${a._id} - ${a.status}`));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
