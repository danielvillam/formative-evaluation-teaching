import { connectToDatabase } from './db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const db = await connectToDatabase();
    const teachers = await db.collection('teachers').find({}).toArray();
    res.status(200).json(teachers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los docentes' });
  }
}