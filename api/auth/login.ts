import { createDatabaseService } from '../../lib/database.js';
import { comparePassword, generateToken } from '../../lib/auth.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { D1DatabaseService } from '../../lib/database';
import { userLoginSchema } from '../../lib/validation-workers';
import { ApiResponse, LoginRequest } from '../../types/index.js';

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    // Handle CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Method not allowed' 
      } as ApiResponse), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const body = await request.json() as LoginRequest;
      
      // Validate request body
      const { error, value } = userLoginSchema.validate(body);
      
      if (error) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Validation error',
          error: error.details[0].message
        } as ApiResponse), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { callsign, password } = value;

          const db = new D1DatabaseService(env.DB);

      // Find user by callsign
      const user = await db.getUserByCallsign(callsign);

      if (!user) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Invalid credentials'
        } as ApiResponse), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Invalid credentials'
        } as ApiResponse), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id.toString(),
        callsign: user.callsign,
        email: user.email
      });

      // Update last login time
      await db.updateUser(user.id, { updated_at: new Date().toISOString() });

      // Return success response (without password)
      const userResponse = {
        id: user.id,
        callsign: user.callsign,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isVerified: user.is_verified === 1,
        createdAt: user.created_at
      };

      return new Response(JSON.stringify({
        success: true,
        data: {
          user: userResponse,
          token
        },
        message: 'Login successful'
      } as ApiResponse), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Login error:', error);
      return new Response(JSON.stringify({
        success: false,
        message: 'Internal server error'
      } as ApiResponse), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
