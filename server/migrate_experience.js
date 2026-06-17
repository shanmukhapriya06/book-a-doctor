require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const doctorModel = require('./models/docModel');

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const doctors = await doctorModel.find({});
    console.log(`Found ${doctors.length} doctors`);

    let updated = 0;
    for (const doctor of doctors) {
      const raw = doctor.experience;
      let numericValue = 0;

      if (typeof raw === 'number') {
        numericValue = raw;
      } else if (typeof raw === 'string' && raw.trim() !== '') {
        const parsed = parseInt(raw.replace(/\D/g, ''), 10);
        numericValue = isNaN(parsed) ? 0 : parsed;
      }

      if (doctor.experience !== numericValue) {
        await doctorModel.findByIdAndUpdate(doctor._id, { experience: numericValue });
        console.log(`Updated ${doctor.fullName}: "${raw}" → ${numericValue}`);
        updated++;
      }
    }

    console.log(`Migration complete. ${updated} of ${doctors.length} doctors updated.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
