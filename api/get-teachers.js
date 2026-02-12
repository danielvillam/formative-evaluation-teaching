import { connectToDatabase } from './db.js';

export default async function handler(req, res) {
  // Add CORS headers for better compatibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    console.log('Starting get-teachers request');
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    
    const db = await connectToDatabase();
    console.log('Database connection established');
    
    const teachers = await db.collection('teachers').find({}).toArray();
    console.log(`Found ${teachers.length} teachers in database`);
    
    res.status(200).json(teachers);
  } catch (error) {
    console.error('Error in get-teachers endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error al obtener los docentes', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}