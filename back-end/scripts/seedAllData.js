require('dotenv').config();
const connectDB = require('../config/db');
const fs = require('fs');
const path = require('path');
const { ObjectId } = require('mongoose').Types;

// Import all models
const User = require('../models/User');
const Institute = require('../models/Institute');
const Department = require('../models/Department');
const Event = require('../models/Event');
const Group = require('../models/Group');

function convertMongoExtendedJSON(obj) {
    if (Array.isArray(obj)) {
        return obj.map(convertMongoExtendedJSON);
    }
    
    if (obj !== null && typeof obj === 'object') {
        const converted = {};
        for (const [key, value] of Object.entries(obj)) {
            if (key === '$oid' && typeof value === 'string') {
                return new ObjectId(value);
            } else if (key === '$date' && typeof value === 'string') {
                return new Date(value);
            } else {
                converted[key] = convertMongoExtendedJSON(value);
            }
        }
        return converted;
    }
    
    return obj;
}

async function seedAllData() {
    try {
        await connectDB();
        console.log('Connected to database');

        const dataDir = path.join(__dirname, '../../data');

        console.log(' Clearing existing data...');
        await User.deleteMany({});
        await Institute.deleteMany({});
        await Department.deleteMany({});
        await Event.deleteMany({});
        await Group.deleteMany({});

        console.log('Importing institutes...');
        const institutesData = JSON.parse(fs.readFileSync(path.join(dataDir, 'FrolicDB.institutes.json'), 'utf8'));
        const convertedInstitutes = convertMongoExtendedJSON(institutesData);
        await Institute.insertMany(convertedInstitutes);
        console.log(`Imported ${institutesData.length} institutes`);

        console.log('Importing users...');
        const usersData = JSON.parse(fs.readFileSync(path.join(dataDir, 'FrolicDB.users.json'), 'utf8'));
        const convertedUsers = convertMongoExtendedJSON(usersData);
        await User.insertMany(convertedUsers);
        console.log(`Imported ${usersData.length} users`);

        // Import Departments
        console.log(' Importing departments...');
        const departmentsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'FrolicDB.departments.json'), 'utf8'));
        const convertedDepartments = convertMongoExtendedJSON(departmentsData);
        await Department.insertMany(convertedDepartments);
        console.log(`Imported ${departmentsData.length} departments`);

        // Import Events
        console.log('Importing events...');
        const eventsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'FrolicDB.events.json'), 'utf8'));
        const convertedEvents = convertMongoExtendedJSON(eventsData);
        await Event.insertMany(convertedEvents);
        console.log(`Imported ${eventsData.length} events`);

        // Import Groups
        console.log('Importing groups...');
        const groupsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'FrolicDB.groups.json'), 'utf8'));
        const convertedGroups = convertMongoExtendedJSON(groupsData);
        await Group.insertMany(convertedGroups);
        console.log(`Imported ${groupsData.length} groups`);

        console.log(' All data imported successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error importing data:', error.message);
        process.exit(1);
    }
}

seedAllData();
