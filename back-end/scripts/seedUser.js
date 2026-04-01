require('../.env').config(); // 1. Load variables first
const connectDB = require('../config/db'); // 2. Import connection directly
const User = require('../models/User');

async function createUser() {
    try {
        await connectDB(); // 3. Connect to DB without starting the Express server

        const testUser = new User({
            name: "Test Admin",
            email: "test@frolic.com",
            phone: "1234567890",
            password: "hashed_password_example", 
            role: "Admin"
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