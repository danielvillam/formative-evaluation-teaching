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
    console.log('Starting get-all-evaluations request');
    
    const db = await connectToDatabase();
    
    // Get all evaluations
    const evaluations = await db.collection('evaluations').find({}).toArray();
    
    console.log(`Found ${evaluations.length} evaluations in database`);
    
    res.status(200).json(evaluations);
  } catch (error) {
    console.error('Error in get-all-evaluations endpoint:', error.message);
    res.status(500).json({ 
      message: 'Error al obtener evaluaciones', 
      error: error.message
    });
  }
}
