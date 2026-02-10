const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        const User = mongoose.connection.db.collection('users');
        const boys = await User.find({ role: 'deliveryBoy' }).toArray();
        console.log(`Found ${boys.length} delivery boys:`);
        boys.forEach(b => {
            console.log(`- ${b.name}: Location: ${JSON.stringify(b.location)}`);
        });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
