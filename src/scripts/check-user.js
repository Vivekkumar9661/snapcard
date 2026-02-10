const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        const User = mongoose.connection.db.collection('users');
        const userId = "69653e4c32755ef9bd5e6f5d";
        const user = await User.findOne({ _id: new mongoose.Types.ObjectId(userId) });

        console.log('--- USER DEBUG ---');
        if (user) {
            console.log('ID:', user._id);
            console.log('Name:', user.name);
            console.log('Role:', user.role);
            console.log('Location:', JSON.stringify(user.location));
            console.log('IsOnline:', user.isOnline);
        } else {
            console.log('USER NOT FOUND IN DB');
        }

        const Assignment = mongoose.connection.db.collection('deliveryassignments');
        const totalAssignments = await Assignment.countDocuments();
        console.log('Total Assignments in DB:', totalAssignments);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkUser();
