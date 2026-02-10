const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        const col = mongoose.connection.db.collection('users');
        const user = await col.findOne({ _id: new mongoose.Types.ObjectId("69653e4c32755ef9bd5e6f5d") });
        console.log('User Data:', JSON.stringify(user, null, 2));

        const assignmentsCol = mongoose.connection.db.collection('deliveryassignments');
        const count = await assignmentsCol.countDocuments();
        console.log('Total Assignments:', count);

        const sample = await assignmentsCol.find({}).limit(1).toArray();
        console.log('Sample Assignment:', JSON.stringify(sample[0], null, 2));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
