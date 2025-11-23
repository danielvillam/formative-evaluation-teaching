import { clerkClient } from '@clerk/clerk-sdk-node';

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

  try {
    console.log('Starting update-user-metadata request');
    console.log('Request body:', req.body);
    console.log('CLERK_SECRET_KEY exists:', !!process.env.CLERK_SECRET_KEY);
    console.log('CLERK_SECRET_KEY starts with:', process.env.CLERK_SECRET_KEY?.substring(0, 10));

    const { userId, role } = req.body;

    if (!userId || !role) {
      console.error('Missing userId or role:', { userId, role });
      return res.status(400).json({ message: 'userId y role son requeridos' });
    }

    // Validate role
    if (!['student', 'teacher', 'director'].includes(role)) {
      console.error('Invalid role:', role);
      return res.status(400).json({ message: 'Rol inválido' });
    }

    console.log('Updating user metadata:', { userId, role });

    // Update user's public metadata with role
    const user = await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        role: role
      }
    });

    console.log('User metadata updated successfully:', user.id);

    res.status(200).json({ 
      success: true, 
      message: 'Metadata actualizada correctamente',
      role: user.publicMetadata.role 
    });
  } catch (error) {
    console.error('Error updating user metadata:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', error);
    res.status(500).json({ 
      message: 'Error al actualizar metadata del usuario', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
