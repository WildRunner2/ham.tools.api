import { createDatabaseService } from '../../lib/database.js';
import { hashPassword, generateToken, validateCallsign, validateEmail } from '../../lib/auth.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { D1DatabaseService } from '../../lib/database';
import { userRegistrationSchema } from '../../lib/validation-workers';
import { ApiResponse, RegisterRequest } from '../../types/index.js';

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
      const body = await request.json() as RegisterRequest;
      
      // Validate request body
      const { error, value } = userRegistrationSchema.validate(body);
      
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

      const { callsign, email, password, firstName, lastName } = value;

      // Additional validation
      if (!validateCallsign(callsign)) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Invalid callsign format'
        } as ApiResponse), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (!validateEmail(email)) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Invalid email format'
        } as ApiResponse), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

          const db = new D1DatabaseService(env.DB);

      // Check if user already exists
      const existingUserByCallsign = await db.getUserByCallsign(callsign);
      const existingUserByEmail = await db.getUserByEmail(email);

      if (existingUserByCallsign || existingUserByEmail) {
        return new Response(JSON.stringify({
          success: false,
          message: 'User with this callsign or email already exists'
        } as ApiResponse), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const newUser = await db.createUser({
        callsign: callsign.toUpperCase(),
        email: email.toLowerCase(),
        password: hashedPassword,
        first_name: firstName,
        last_name: lastName
      });

      if (!newUser) {
        throw new Error('Failed to create user');
      }

      // Generate JWT token
      const token = generateToken({
        userId: newUser.id.toString(),
        callsign: newUser.callsign,
        email: newUser.email
      });

      // Return success response (without password)
      const userResponse = {
        id: newUser.id,
        callsign: newUser.callsign,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        isVerified: newUser.is_verified === 1,
        createdAt: newUser.created_at
      };

      return new Response(JSON.stringify({
        success: true,
        data: {
          user: userResponse,
          token
        },
        message: 'User registered successfully'
      } as ApiResponse), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Registration error:', error);
      return new Response(JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
