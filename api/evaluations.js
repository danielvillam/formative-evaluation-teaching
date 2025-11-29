import { connectToDatabase } from './db.js';

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    const db = await connectToDatabase();

    // GET all evaluations (for director)
    if (action === 'all' && req.method === 'GET') {
      console.log('Fetching all evaluations');
      const evaluations = await db.collection('evaluations').find({}).toArray();
      console.log(`Found ${evaluations.length} evaluations`);
      return res.status(200).json({ evaluations });
    }

    // GET student evaluations
    if (action === 'student' && req.method === 'GET') {
      const { userEmail } = req.query;
      if (!userEmail) {
        return res.status(400).json({ message: 'userEmail es requerido' });
      }
      console.log('Fetching evaluations for student:', userEmail);
      const evaluations = await db.collection('evaluations')
        .find({ userEmail, userRole: 'student' })
        .toArray();
      const evaluatedTeacherIds = evaluations.map(e => e.teacherId);
      console.log(`Student ${userEmail} has evaluated ${evaluatedTeacherIds.length} teachers`);
      return res.status(200).json({ evaluatedTeacherIds });
    }

    // GET teacher results
    if (action === 'teacher-results' && req.method === 'GET') {
      const { teacherId } = req.query;
      if (!teacherId) {
        return res.status(400).json({ message: 'teacherId es requerido' });
      }
      console.log('Fetching results for teacher:', teacherId);

      const selfEvaluation = await db.collection('evaluations')
        .findOne({ teacherId, userRole: 'teacher' });

      const studentEvaluations = await db.collection('evaluations')
        .find({ teacherId, userRole: 'student' })
        .toArray();

      const hasData = !!selfEvaluation || studentEvaluations.length > 0;

      console.log(`Teacher ${teacherId}: selfEval=${!!selfEvaluation}, studentEvals=${studentEvaluations.length}`);
      
      return res.status(200).json({
        hasData,
        selfEvaluation,
        studentEvaluations,
      });
    }

    // GET teacher self-evaluation check
    if (action === 'teacher-self-check' && req.method === 'GET') {
      const { teacherId } = req.query;
      if (!teacherId) {
        return res.status(400).json({ message: 'teacherId es requerido' });
      }
      console.log('Checking self-evaluation for teacher:', teacherId);
      
      const selfEvaluation = await db.collection('evaluations')
        .findOne({ teacherId, userRole: 'teacher' });

      const hasEvaluated = !!selfEvaluation;
      console.log(`Teacher ${teacherId} has self-evaluated: ${hasEvaluated}`);
      
      return res.status(200).json({ hasEvaluated });
    }

    // POST submit evaluation
    if (action === 'submit' && req.method === 'POST') {
      const { teacherId, evaluationData, userEmail, userRole } = req.body;

      if (!teacherId || !evaluationData || !userEmail || !userRole) {
        return res.status(400).json({ message: 'Datos incompletos' });
      }

      console.log('Starting submit-evaluation request');
      console.log('TeacherId:', teacherId, 'UserEmail:', userEmail, 'UserRole:', userRole);
      
      const result = await db.collection('evaluations').insertOne({
        teacherId,
        evaluationData,
        userEmail,
        userRole,
        createdAt: new Date(),
      });

      console.log('Evaluation inserted with ID:', result.insertedId);
      return res.status(201).json({ message: 'Evaluación enviada correctamente', id: result.insertedId });
    }

    return res.status(400).json({ message: 'Acción no válida' });

  } catch (error) {
    console.error('Error in evaluations endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error en el servidor', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
