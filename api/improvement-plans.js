import { connectToDatabase } from './db.js';

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = await connectToDatabase();

    // GET improvement plans
    if (req.method === 'GET') {
      const { teacherId } = req.query;

      if (!teacherId) {
        return res.status(400).json({ message: 'teacherId es requerido' });
      }

      console.log('Fetching improvement plans for teacherId:', teacherId);
      
      const plans = await db.collection('improvementPlan')
        .find({ teacherId })
        .sort({ createdAt: -1 })
        .toArray();

      console.log(`Found ${plans.length} improvement plan(s) for teacher ${teacherId}`);
      
      return res.status(200).json({ 
        plans,
        count: plans.length
      });
    }

    // POST save improvement plan
    if (req.method === 'POST') {
      const { teacherId, goal, actions, indicators, deadline, userEmail } = req.body;

      if (!teacherId || !goal || !actions || !indicators || !deadline || !userEmail) {
        return res.status(400).json({ message: 'Datos incompletos' });
      }

      console.log('Starting save-improvement-plan request');
      console.log('TeacherId:', teacherId, 'UserEmail:', userEmail);
      
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
      return res.status(201).json({ 
        message: 'Plan de mejora guardado correctamente', 
        id: result.insertedId 
      });
    }

    return res.status(405).json({ message: 'Método no permitido' });

  } catch (error) {
    console.error('Error in improvement-plans endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error en el servidor', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
