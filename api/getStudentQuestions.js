import { connectToDatabase } from './db.js';

export default async function handler(req, res) {
  // Add CORS headers
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
    console.log('Starting getStudentQuestions request');
    
    const db = await connectToDatabase();
    console.log('Database connection established');
    
    const questions = await db.collection('studentQuestions').find({}).toArray();
    console.log(`Found ${questions.length} student questions in database`);
    
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error in getStudentQuestions endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error al obtener las preguntas de estudiantes', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}