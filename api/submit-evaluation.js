import { connectToDatabase } from './db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { teacherId, evaluationData } = req.body;

  if (!teacherId || !evaluationData) {
    return res.status(400).json({ message: 'Datos incompletos' });
  }

  try {
    const db = await connectToDatabase();
    const result = await db.collection('evaluations').insertOne({
      teacherId,
      evaluationData,
      createdAt: new Date(),
    });

    res.status(201).json({ message: 'Evaluación enviada correctamente', id: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al enviar la evaluación' });
  }
}