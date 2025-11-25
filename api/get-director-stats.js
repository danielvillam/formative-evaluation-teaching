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
    console.log('Starting get-director-stats request');
    
    const db = await connectToDatabase();
    
    // Get all teachers
    const teachers = await db.collection('teachers').find({}).toArray();
    
    // Get all evaluations
    const evaluations = await db.collection('evaluations').find({}).toArray();
    
    // Get teacher questions to know categories
    const teacherQuestions = await db.collection('teacherQuestions').find({}).toArray();
    
    // Get student questions
    const studentQuestions = await db.collection('studentQuestions').find({}).toArray();
    
    // Calculate statistics
    const stats = {
      totalTeachers: teachers.length,
      totalEvaluations: evaluations.length,
      selfEvaluations: evaluations.filter(e => e.userRole === 'teacher').length,
      studentEvaluations: evaluations.filter(e => e.userRole === 'student').length,
      teachers: [],
      overallAverage: 0,
      categoryAverages: {}
    };
    
    // Process each teacher's data
    teachers.forEach(teacher => {
      const teacherId = teacher.id;
      const teacherEvals = evaluations.filter(e => e.teacherId === teacherId);
      
      const selfEval = teacherEvals.find(e => e.userRole === 'teacher');
      const studentEvals = teacherEvals.filter(e => e.userRole === 'student');
      
      // Calculate averages
      let selfAverage = 0;
      let studentAverage = 0;
      
      if (selfEval) {
        const scores = selfEval.evaluationData?.scores || selfEval.evaluationData || {};
        const values = Object.values(scores).filter(v => typeof v === 'number' && v > 0);
        if (values.length > 0) {
          selfAverage = values.reduce((a, b) => a + b, 0) / values.length;
        }
      }
      
      if (studentEvals.length > 0) {
        const allScores = [];
        studentEvals.forEach(evaluation => {
          const scores = evaluation.evaluationData?.scores || evaluation.evaluationData || {};
          Object.values(scores).forEach(score => {
            if (typeof score === 'number' && score > 0) {
              allScores.push(score);
            }
          });
        });
        if (allScores.length > 0) {
          studentAverage = allScores.reduce((a, b) => a + b, 0) / allScores.length;
        }
      }
      
      const overallAverage = selfAverage > 0 && studentAverage > 0 
        ? (selfAverage + studentAverage) / 2
        : selfAverage > 0 ? selfAverage : studentAverage;
      
      stats.teachers.push({
        id: teacherId,
        name: teacher.name,
        selfAverage: parseFloat(selfAverage.toFixed(2)),
        studentAverage: parseFloat(studentAverage.toFixed(2)),
        overallAverage: parseFloat(overallAverage.toFixed(2)),
        studentEvaluationCount: studentEvals.length,
        hasSelfEvaluation: !!selfEval
      });
    });
    
    // Calculate overall average across all teachers
    const validAverages = stats.teachers
      .map(t => t.overallAverage)
      .filter(a => a > 0);
    
    if (validAverages.length > 0) {
      stats.overallAverage = parseFloat(
        (validAverages.reduce((a, b) => a + b, 0) / validAverages.length).toFixed(2)
      );
    }
    
    // Calculate category averages if we have teacher questions with categories
    const categoriesMap = {};
    teacherQuestions.forEach(q => {
      if (q.category) {
        if (!categoriesMap[q.category]) {
          categoriesMap[q.category] = [];
        }
        categoriesMap[q.category].push(q.id);
      }
    });
    
    // For each category, calculate average across all evaluations
    Object.keys(categoriesMap).forEach(category => {
      const questionIds = categoriesMap[category];
      const allScoresInCategory = [];
      
      evaluations.forEach(evaluation => {
        const scores = evaluation.evaluationData?.scores || evaluation.evaluationData || {};
        questionIds.forEach(qId => {
          if (scores[qId] && typeof scores[qId] === 'number' && scores[qId] > 0) {
            allScoresInCategory.push(scores[qId]);
          }
        });
      });
      
      if (allScoresInCategory.length > 0) {
        stats.categoryAverages[category] = parseFloat(
          (allScoresInCategory.reduce((a, b) => a + b, 0) / allScoresInCategory.length).toFixed(2)
        );
      }
    });
    
    console.log(`Director stats calculated: ${stats.totalTeachers} teachers, ${stats.totalEvaluations} evaluations`);
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error in get-director-stats endpoint:', error.message);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas', 
      error: error.message
    });
  }
}
