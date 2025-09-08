// backend/src/utils/scheduler.js
const cron = require('node-cron');
const Goal = require('../models/Goal');
const User = require('../models/User');

// Run daily decay calculation at midnight
const startDailyDecayJob = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily goal decay...');
    
    try {
      const goals = await Goal.find({ isActive: true });
      
      for (const goal of goals) {
        goal.calculateDecay();
        await goal.save();
      }
      
      console.log(`Processed decay for ${goals.length} goals`);
    } catch (error) {
      console.error('Daily decay job failed:', error);
    }
  });
};

// Run reminder notifications at user's preferred time
const startReminderJob = () => {
  // Check every hour for users who need reminders
  cron.schedule('0 * * * *', async () => {
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();
    
    if (currentMinute === 0) { // Only run on the hour
      try {
        const users = await User.find({
          'preferences.enableNotifications': true,
          'preferences.reminderTime': `${currentHour}:00`
        }).populate('goals');
        
        for (const user of users) {
          // Here you would send reminder notifications
          // For now, just log
          console.log(`Reminder time for ${user.email}`);
        }
      } catch (error) {
        console.error('Reminder job failed:', error);
      }
    }
  });
};

module.exports = {
  startDailyDecayJob,
  startReminderJob
};