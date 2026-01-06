// Test script to verify admin permissions
const db = require('./src/models');

async function testAdminPermissions() {
  try {
    console.log('🔍 Testing admin permissions...\n');

    // 1. Find all users with admin role
    const admins = await db.Utilisateur.findAll({
      include: [{ model: db.Administrateur }],
      where: {}
    });

    console.log('👥 Found users:', admins.length);
    
    for (const user of admins) {
      console.log(`📧 User: ${user.email}`);
      console.log(`🔑 ID: ${user.id}`);
      console.log(`👤 Has Admin Profile: ${!!user.Administrateur}`);
      console.log(`✅ Active: ${user.estActif}`);
      console.log('---');
    }

    // 2. Test specific admin user
    const testAdmin = await db.Utilisateur.findOne({
      where: { email: 'admin.test@saintjeaningenieur.org' },
      include: [{ model: db.Administrateur }]
    });

    if (testAdmin) {
      console.log('\n🎯 Test Admin Found:');
      console.log(`📧 Email: ${testAdmin.email}`);
      console.log(`🔑 ID: ${testAdmin.id}`);
      console.log(`👤 Has Admin Profile: ${!!testAdmin.Administrateur}`);
      console.log(`✅ Active: ${testAdmin.estActif}`);
      
      if (testAdmin.Administrateur) {
        console.log('✅ Admin permissions verified!');
      } else {
        console.log('❌ Admin profile missing - creating...');
        await db.Administrateur.create({
          id: testAdmin.id,
          nom: testAdmin.nom,
          prenom: testAdmin.prenom,
          email: testAdmin.email
        });
        console.log('✅ Admin profile created!');
      }
    } else {
      console.log('❌ Test admin not found');
    }

    // 3. Test course data
    console.log('\n📚 Testing course data...');
    const courses = await db.Cours.findAll();
    console.log(`Found ${courses.length} courses:`);
    courses.forEach(course => {
      console.log(`  - ${course.nom} (ID: ${course.id})`);
    });

    // 4. Test evaluation data
    console.log('\n📝 Testing evaluation data...');
    const evaluations = await db.Evaluation.findAll({
      include: [
        { model: db.Cours, required: false },
        { model: db.Administrateur, required: false }
      ]
    });
    
    console.log(`Found ${evaluations.length} evaluations:`);
    evaluations.forEach(evaluation => {
      console.log(`  - ${evaluation.titre}`);
      console.log(`    Course: ${evaluation.Cour?.nom || evaluation.Cours?.nom || 'No course'}`);
      console.log(`    Admin ID: ${evaluation.administrateur_id}`);
      console.log(`    Status: ${evaluation.statut}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testAdminPermissions();