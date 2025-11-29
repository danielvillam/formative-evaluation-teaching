import { connectToDatabase } from './db.js';

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = await connectToDatabase();

    // GET all teachers
    if (req.method === 'GET') {
      console.log('Fetching all teachers from database');
      
      const teachers = await db.collection('teachers').find({}).toArray();
      
      if (!teachers || teachers.length === 0) {
        console.warn('No teachers found in database');
        return res.status(200).json([]);
      }

      console.log(`Found ${teachers.length} teachers in database`);
      return res.status(200).json(teachers);
    }

    // POST add new teacher
    if (req.method === 'POST') {
      const { id, name, subject } = req.body;

      if (!id || !name) {
        return res.status(400).json({ message: 'ID y nombre son requeridos' });
      }

      console.log('Adding new teacher:', { id, name, subject });

      const existingTeacher = await db.collection('teachers').findOne({ id });
      if (existingTeacher) {
        return res.status(409).json({ message: 'El docente ya existe' });
      }

      const result = await db.collection('teachers').insertOne({
        id,
        name,
        subject: subject || '',
        createdAt: new Date(),
      });

      console.log('Teacher added with ID:', result.insertedId);
      return res.status(201).json({ 
        message: 'Docente agregado correctamente', 
        id: result.insertedId 
      });
    }

    return res.status(405).json({ message: 'Método no permitido' });

  } catch (error) {
    console.error('Error in teachers endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error en el servidor', 
      error: error.message 
    });
  }
}
