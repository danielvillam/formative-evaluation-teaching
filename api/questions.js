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

  const { type } = req.query;

  try {
    const db = await connectToDatabase();
    
    let collection;
    if (type === 'teacher') {
      collection = 'teacherQuestions';
    } else if (type === 'student') {
      collection = 'studentQuestions';
    } else {
      return res.status(400).json({ message: 'Tipo no válido. Use type=teacher o type=student' });
    }

    console.log(`Fetching ${type} questions from collection: ${collection}`);
    
    const questions = await db.collection(collection).find({}).toArray();
    
    if (!questions || questions.length === 0) {
      console.warn(`No questions found in ${collection}`);
      return res.status(200).json([]);
    }

    console.log(`Found ${questions.length} questions in ${collection}`);
    res.status(200).json(questions);
    
  } catch (error) {
    console.error('Error fetching questions:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error al obtener las preguntas', 
      error: error.message 
    });
  }
}
