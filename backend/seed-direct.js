const { seedDatabase } = require('./src/routes/init.routes');

async function seedDirect() {
  try {
    console.log('🌱 Seeding database directly...\n');
    
    const result = await seedDatabase();
    
    console.log('\n✅ Seeding successful!');
    console.log(JSON.stringify(result, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.errors) {
      error.errors.forEach(err => {
        console.error('  -', err.message);
      });
    }
    process.exit(1);
  }
}

seedDirect();
