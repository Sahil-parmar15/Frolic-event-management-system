require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function createUser() {
    try {
        await connectDB();

        const hashedPassword = await bcrypt.hash('admin123', 10);

        const testUser = new User({
            UserName: "admin",
            UserPassword: hashedPassword,
            EmailAddress: "admin@frolic.com",
            PhoneNumber: "1234567890",
            IsAdmin: true
        });

        await testUser.save();
        
        console.log("✅ User created successfully in FrolicDB!");
        process.exit(0); 
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}

createUser();