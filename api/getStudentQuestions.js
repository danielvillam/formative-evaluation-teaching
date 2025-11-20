import { connectToDatabase } from './db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const db = await connectToDatabase();
    const questions = await db.collection('studentQuestions').find({}).toArray();
    res.status(200).json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las preguntas de estudiantes' });
  }
}