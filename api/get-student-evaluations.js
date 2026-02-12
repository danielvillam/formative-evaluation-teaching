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

  const { userEmail } = req.query;

  if (!userEmail) {
    return res.status(400).json({ message: 'Email de usuario requerido' });
  }

  try {
    console.log('Fetching evaluations for user:', userEmail);
    
    const db = await connectToDatabase();
    
    // Get all evaluations by this student
    const evaluations = await db.collection('evaluations')
      .find({ 
        userEmail: userEmail,
        userRole: 'student'
      })
      .project({ teacherId: 1, createdAt: 1 })
      .toArray();

    // Extract unique teacher IDs that have been evaluated
    const evaluatedTeacherIds = [...new Set(evaluations.map(e => e.teacherId))];

    console.log('Found evaluations for teachers:', evaluatedTeacherIds);
    res.status(200).json({ evaluatedTeacherIds });
  } catch (error) {
    console.error('Error in get-student-evaluations endpoint:', error.message);
    res.status(500).json({ 
      message: 'Error al obtener evaluaciones', 
      error: error.message
    });
  }
}
