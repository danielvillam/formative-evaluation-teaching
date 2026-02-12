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
    console.log('Fetching results for teacher:', teacherId);
    
    const db = await connectToDatabase();
    
    // Get teacher's self-evaluation
    const selfEvaluation = await db.collection('evaluations')
      .findOne({ 
        teacherId: teacherId,
        userRole: 'teacher'
      });

    // Get all student evaluations for this teacher
    const studentEvaluations = await db.collection('evaluations')
      .find({ 
        teacherId: teacherId,
        userRole: 'student'
      })
      .toArray();

    console.log('Found self-evaluation:', !!selfEvaluation);
    console.log('Found student evaluations:', studentEvaluations.length);

    res.status(200).json({ 
      selfEvaluation: selfEvaluation || null,
      studentEvaluations: studentEvaluations || [],
      hasData: !!(selfEvaluation || studentEvaluations.length > 0)
    });
  } catch (error) {
    console.error('Error in get-teacher-results endpoint:', error.message);
    res.status(500).json({ 
      message: 'Error al obtener resultados', 
      error: error.message
    });
  }
}
