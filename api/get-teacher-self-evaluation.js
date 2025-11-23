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
    return res.status(400).json({ message: 'ID de docente requerido' });
  }

  try {
    console.log('Checking self-evaluation for teacher:', teacherId);
    
    const db = await connectToDatabase();
    
    // Check if teacher has submitted a self-evaluation
    const evaluation = await db.collection('evaluations')
      .findOne({ 
        teacherId: teacherId,
        userRole: 'teacher'
      });

    const hasEvaluated = evaluation !== null;
    const evaluationDate = evaluation?.createdAt || null;

    console.log('Teacher self-evaluation status:', hasEvaluated);
    res.status(200).json({ 
      hasEvaluated,
      evaluationDate 
    });
  } catch (error) {
    console.error('Error in get-teacher-self-evaluation endpoint:', error.message);
    res.status(500).json({ 
      message: 'Error al verificar autoevaluación', 
      error: error.message
    });
  }
}
