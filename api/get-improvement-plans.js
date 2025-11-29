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

  const { teacherId } = req.query;

  if (!teacherId) {
    return res.status(400).json({ message: 'teacherId es requerido' });
  }

  try {
    console.log('Fetching improvement plans for teacherId:', teacherId);
    
    const db = await connectToDatabase();
    
    const plans = await db.collection('improvementPlan')
      .find({ teacherId })
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`Found ${plans.length} improvement plan(s) for teacher ${teacherId}`);
    
    res.status(200).json({ 
      plans,
      count: plans.length
    });
  } catch (error) {
    console.error('Error in get-improvement-plans endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error al obtener los planes de mejora', 
      error: error.message 
    });
  }
}
