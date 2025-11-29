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

  const { teacherId, goal, actions, indicators, deadline, userEmail } = req.body;

  if (!teacherId || !goal || !actions || !indicators || !deadline || !userEmail) {
    return res.status(400).json({ message: 'Datos incompletos' });
  }

  try {
    console.log('Starting save-improvement-plan request');
    console.log('TeacherId:', teacherId, 'UserEmail:', userEmail);
    
    const db = await connectToDatabase();
    console.log('Database connection established');
    
    const result = await db.collection('improvementPlan').insertOne({
      teacherId,
      userEmail,
      goal,
      actions,
      indicators,
      deadline,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('Improvement plan inserted with ID:', result.insertedId);
    res.status(201).json({ 
      message: 'Plan de mejora guardado correctamente', 
      id: result.insertedId 
    });
  } catch (error) {
    console.error('Error in save-improvement-plan endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error al guardar el plan de mejora', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
