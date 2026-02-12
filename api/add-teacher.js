import { connectToDatabase } from './db.js';

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { teacherId, name } = req.body;

  if (!teacherId || !name) {
    return res.status(400).json({ message: 'ID y nombre de docente requeridos' });
  }

  try {
    console.log('Adding teacher to database:', teacherId, name);
    
    const db = await connectToDatabase();
    
    // Check if teacher already exists
    const existingTeacher = await db.collection('teachers').findOne({ 
      id: teacherId 
    });

    if (existingTeacher) {
      console.log('Teacher already exists:', teacherId);
      return res.status(200).json({ 
        message: 'Docente ya existe en la base de datos',
        teacher: existingTeacher
      });
    }

    // Add new teacher
    const result = await db.collection('teachers').insertOne({
      id: teacherId,
      name: name
    });

    console.log('Teacher added successfully:', result.insertedId);
    res.status(201).json({ 
      message: 'Docente agregado correctamente',
      teacherId: result.insertedId
    });
  } catch (error) {
    console.error('Error in add-teacher endpoint:', error.message);
    res.status(500).json({ 
      message: 'Error al agregar docente', 
      error: error.message
    });
  }
}
