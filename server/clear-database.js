const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/candidate-notes', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function clearDatabase() {
  try {
    // Wait for connection to be established
    await mongoose.connection.asPromise();
    console.log('Connected to MongoDB');
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log('Found collections:', collections.map(c => c.name));
    
    // Delete all documents from each collection
    for (const collection of collections) {
      const result = await mongoose.connection.db.collection(collection.name).deleteMany({});
      console.log(`✓ Deleted ${result.deletedCount} documents from ${collection.name}`);
    }
    
    console.log('\n🎉 Database cleared successfully!');
    console.log('All collections are now empty.');
    
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

clearDatabase(); 