require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Create Prisma Client instance
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.activity.deleteMany();
  await prisma.message.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.award.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@edu.com',
      name: 'Admin User',
      password_hash: adminPassword,
      role: 'ADMIN',
      avatar: 'https://i.pravatar.cc/150?img=1',
      phone: '+1234567890',
      bio: 'System Administrator',
    },
  });

  console.log('✅ Created admin user');

  // Create Instructors
  const instructor1Password = await bcrypt.hash('instructor123', 10);
  const instructor1 = await prisma.user.create({
    data: {
      email: 'john.doe@edu.com',
      name: 'John Doe',
      password_hash: instructor1Password,
      role: 'INSTRUCTOR',
      avatar: 'https://i.pravatar.cc/150?img=12',
      phone: '+1234567891',
      bio: 'Web Development Expert',
    },
  });

  const instructor2 = await prisma.user.create({
    data: {
      email: 'jane.smith@edu.com',
      name: 'Jane Smith',
      password_hash: instructor1Password,
      role: 'INSTRUCTOR',
      avatar: 'https://i.pravatar.cc/150?img=5',
      phone: '+1234567892',
      bio: 'Data Science Specialist',
    },
  });

  console.log('✅ Created instructors');

  // Create Students
  const studentPassword = await bcrypt.hash('student123', 10);
  const students = [];
  for (let i = 1; i <= 25; i++) {
    const student = await prisma.user.create({
      data: {
        email: `student${i}@edu.com`,
        name: `Student ${i}`,
        password_hash: studentPassword,
        role: 'STUDENT',
        avatar: `https://i.pravatar.cc/150?img=${i + 10}`,
        phone: `+123456789${i}`,
        bio: `Computer Science Student`,
      },
    });
    students.push(student);
  }

  console.log('✅ Created 25 students');

  // Create Courses
  const courses = [
    {
      title: 'Full Stack Web Development',
      description: 'Learn to build modern web applications with React, Node.js, and PostgreSQL',
      category: 'Web Development',
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
      price: 299.99,
      instructorName: 'John Doe',
      duration: '12 weeks',
      level: 'Intermediate',
      isActive: true,
      totalSales: 15,
    },
    {
      title: 'Data Science with Python',
      description: 'Master data analysis, visualization, and machine learning with Python',
      category: 'Data Science',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
      price: 349.99,
      instructorName: 'Jane Smith',
      duration: '10 weeks',
      level: 'Advanced',
      isActive: true,
      totalSales: 12,
    },
    {
      title: 'UI/UX Design Fundamentals',
      description: 'Create beautiful and user-friendly interfaces',
      category: 'Design',
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5',
      price: 199.99,
      instructorName: 'John Doe',
      duration: '8 weeks',
      level: 'Beginner',
      isActive: true,
      totalSales: 20,
    },
    {
      title: 'Mobile App Development',
      description: 'Build native mobile apps with React Native',
      category: 'Mobile Development',
      thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c',
      price: 279.99,
      instructorName: 'Jane Smith',
      duration: '10 weeks',
      level: 'Intermediate',
      isActive: true,
      totalSales: 8,
    },
    {
      title: 'Cloud Computing with AWS',
      description: 'Deploy and manage applications on Amazon Web Services',
      category: 'Cloud',
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
      price: 399.99,
      instructorName: 'John Doe',
      duration: '14 weeks',
      level: 'Advanced',
      isActive: true,
      totalSales: 6,
    },
  ];

  const createdCourses = [];
  for (const courseData of courses) {
    const course = await prisma.course.create({
      data: courseData,
    });
    createdCourses.push(course);
  }

  console.log('✅ Created 5 courses');

  // Create Batches
  const batches = [];
  for (const course of createdCourses) {
    // Create 2 batches per course
    for (let i = 0; i < 2; i++) {
      const batch = await prisma.batch.create({
        data: {
          courseId: course.id,
          startDate: new Date(2025, i * 3, 1), // Different start dates
          maxSeats: 30,
          currentEnrolled: 0,
        },
      });
      batches.push(batch);
    }
  }

  console.log('✅ Created 10 batches');

  // Create Enrollments
  let totalEnrollments = 0;
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    // Each student enrolls in 1-3 random batches
    const numEnrollments = Math.floor(Math.random() * 3) + 1;
    const selectedBatches = [];
    
    for (let j = 0; j < numEnrollments; j++) {
      const randomBatch = batches[Math.floor(Math.random() * batches.length)];
      
      // Avoid duplicate enrollments
      if (!selectedBatches.includes(randomBatch.id)) {
        selectedBatches.push(randomBatch.id);
        
        await prisma.enrollment.create({
          data: {
            userId: student.id,
            batchId: randomBatch.id,
            status: Math.random() > 0.2 ? 'CONFIRMED' : 'PENDING',
            progress: Math.floor(Math.random() * 100),
          },
        });

        // Update batch enrollment count
        await prisma.batch.update({
          where: { id: randomBatch.id },
          data: { currentEnrolled: { increment: 1 } },
        });

        totalEnrollments++;
      }
    }
  }

  console.log(`✅ Created ${totalEnrollments} enrollments`);

  // Create Transactions (Revenue)
  const transactionCount = 50;
  for (let i = 0; i < transactionCount; i++) {
    const randomCourse = createdCourses[Math.floor(Math.random() * createdCourses.length)];
    const randomStudent = students[Math.floor(Math.random() * students.length)];
    const monthsAgo = Math.floor(Math.random() * 12);
    const createdDate = new Date();
    createdDate.setMonth(createdDate.getMonth() - monthsAgo);

    await prisma.transaction.create({
      data: {
        courseId: randomCourse.id,
        userId: randomStudent.id,
        amount: randomCourse.price,
        type: 'REVENUE',
        status: Math.random() > 0.1 ? 'COMPLETED' : Math.random() > 0.5 ? 'PENDING' : 'FAILED',
        paymentMethod: ['Credit Card', 'PayPal', 'Bank Transfer'][Math.floor(Math.random() * 3)],
        description: `Enrollment payment for ${randomCourse.title}`,
        createdAt: createdDate,
      },
    });
  }

  // Create some expense transactions
  for (let i = 0; i < 15; i++) {
    const randomCourse = createdCourses[Math.floor(Math.random() * createdCourses.length)];
    const monthsAgo = Math.floor(Math.random() * 12);
    const createdDate = new Date();
    createdDate.setMonth(createdDate.getMonth() - monthsAgo);

    await prisma.transaction.create({
      data: {
        courseId: randomCourse.id,
        amount: Math.random() * 500 + 100,
        type: 'EXPENSE',
        status: 'COMPLETED',
        description: ['Course materials', 'Platform fees', 'Marketing costs'][Math.floor(Math.random() * 3)],
        createdAt: createdDate,
      },
    });
  }

  console.log('✅ Created 65 transactions');

  // Create Messages
  const messageTemplates = [
    { subject: 'Course Assignment Question', content: 'I have a question about the latest assignment. Can you help?' },
    { subject: 'Request for Extra Time', content: 'Could I get an extension on the project deadline?' },
    { subject: 'Technical Issue', content: 'I am having trouble accessing the course materials.' },
    { subject: 'Feedback Request', content: 'Could you provide feedback on my recent submission?' },
    { subject: 'Course Recommendation', content: 'Which course should I take next?' },
  ];

  for (let i = 0; i < 20; i++) {
    const randomStudent = students[Math.floor(Math.random() * students.length)];
    const randomTemplate = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
    const hoursAgo = Math.floor(Math.random() * 72);
    const createdDate = new Date();
    createdDate.setHours(createdDate.getHours() - hoursAgo);

    await prisma.message.create({
      data: {
        senderId: randomStudent.id,
        receiverId: admin.id,
        subject: randomTemplate.subject,
        content: randomTemplate.content,
        isRead: Math.random() > 0.4,
        createdAt: createdDate,
      },
    });
  }

  console.log('✅ Created 20 messages');

  // Create Activities
  const activityTemplates = [
    { type: 'ENROLLMENT', title: 'New Enrollment', desc: 'enrolled in' },
    { type: 'COMPLETION', title: 'Course Completed', desc: 'completed' },
    { type: 'ACHIEVEMENT', title: 'Achievement Unlocked', desc: 'earned an achievement in' },
    { type: 'SUBMISSION', title: 'Assignment Submitted', desc: 'submitted an assignment for' },
  ];

  for (let i = 0; i < 30; i++) {
    const randomStudent = students[Math.floor(Math.random() * students.length)];
    const randomCourse = createdCourses[Math.floor(Math.random() * createdCourses.length)];
    const randomTemplate = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
    const hoursAgo = Math.floor(Math.random() * 48);
    const createdDate = new Date();
    createdDate.setHours(createdDate.getHours() - hoursAgo);

    await prisma.activity.create({
      data: {
        userId: randomStudent.id,
        title: randomTemplate.title,
        description: `${randomStudent.name} ${randomTemplate.desc} ${randomCourse.title}`,
        type: randomTemplate.type,
        metadata: JSON.stringify({ courseId: randomCourse.id, courseName: randomCourse.title }),
        createdAt: createdDate,
      },
    });
  }

  console.log('✅ Created 30 activities');

  // Create Awards
  const awards = [
    { title: 'First Course Completed', description: 'Complete your first course', icon: '🎓', category: 'Achievement' },
    { title: 'Perfect Score', description: 'Score 100% on an assignment', icon: '⭐', category: 'Excellence' },
    { title: 'Early Bird', description: 'Submit assignment before deadline', icon: '🌅', category: 'Punctuality' },
    { title: 'Top Student', description: 'Rank in top 10% of class', icon: '🏆', category: 'Achievement' },
    { title: 'Helpful Peer', description: 'Help 5 fellow students', icon: '🤝', category: 'Community' },
  ];

  for (const award of awards) {
    await prisma.award.create({
      data: award,
    });
  }

  console.log('✅ Created 5 awards');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`  - 1 Admin`);
  console.log(`  - 2 Instructors`);
  console.log(`  - 25 Students`);
  console.log(`  - 5 Courses`);
  console.log(`  - 10 Batches`);
  console.log(`  - ${totalEnrollments} Enrollments`);
  console.log(`  - 65 Transactions`);
  console.log(`  - 20 Messages`);
  console.log(`  - 30 Activities`);
  console.log(`  - 5 Awards`);
  console.log('\n🔑 Test Credentials:');
  console.log('  Admin: admin@edu.com / admin123');
  console.log('  Instructor: john.doe@edu.com / instructor123');
  console.log('  Student: student1@edu.com / student123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
