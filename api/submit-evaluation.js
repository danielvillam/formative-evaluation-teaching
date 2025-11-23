import { connectToDatabase } from './db.js';

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { teacherId, evaluationData, userEmail, userRole } = req.body;

  if (!teacherId || !evaluationData || !userEmail || !userRole) {
    return res.status(400).json({ message: 'Datos incompletos' });
  }

  try {
    console.log('Starting submit-evaluation request');
    console.log('TeacherId:', teacherId, 'UserEmail:', userEmail, 'UserRole:', userRole);
    
    const db = await connectToDatabase();
    console.log('Database connection established');
    
    const result = await db.collection('evaluations').insertOne({
      teacherId,
      evaluationData,
      userEmail,
      userRole,
      createdAt: new Date(),
    });

    console.log('Evaluation inserted with ID:', result.insertedId);
    res.status(201).json({ message: 'Evaluación enviada correctamente', id: result.insertedId });
  } catch (error) {
    console.error('Error in submit-evaluation endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error al enviar la evaluación', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}