const mongoose = require('mongoose');
const fs = require('fs');

async function createDummy() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const match = env.match(/MONGODB_URL=(.*)/);
        const url = match ? match[1].trim() : null;

        await mongoose.connect(url);

        const Order = mongoose.connection.db.collection('orders');
        const order = await Order.findOne({});

        if (!order) {
            console.log('No orders found to link dummy assignment');
            process.exit(1);
        }

        const Assignment = mongoose.connection.db.collection('deliveryassignments');
        const userId = "69653e4c32755ef9bd5e6f5d";

        const dummy = {
            order: order._id,
            broadcastedTo: [new mongoose.Types.ObjectId(userId)],
            status: "broadcasted",
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const res = await Assignment.insertOne(dummy);
        console.log('Dummy Assignment Created:', res.insertedId);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
createDummy();
