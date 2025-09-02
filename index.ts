// Main entry point for Cloudflare Workers
// This file handles routing to different API endpoints

import registerHandler from './api/auth/register.js';
import loginHandler from './api/auth/login.js';
import photosHandler from './api/photos/index.js';
import iframeHandler from './api/iframe/viewer.js';
import { D1Database } from './lib/database.js';

interface Env {
  DB: D1Database;
  [key: string]: any;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Add CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders
      });
    }

    // Route to appropriate handlers
    try {
      if (pathname === '/api/auth/register') {
        return registerHandler.fetch(request, env);
      } else if (pathname === '/api/auth/login') {
        return loginHandler.fetch(request, env);
      } else if (pathname === '/api/photos') {
        return photosHandler.fetch(request, env);
      } else if (pathname === '/api/iframe/viewer') {
        return iframeHandler.fetch(request, env);
      } else if (pathname === '/') {
        // Health check endpoint
        return new Response(JSON.stringify({
          success: true,
          message: 'SP3FCK Ham Tools API is running',
          version: '1.0.0',
          platform: 'Cloudflare Workers',
          database: 'D1 SQLite',
          endpoints: [
            'POST /api/auth/register',
            'POST /api/auth/login',
            'GET /api/photos',
            'GET /api/iframe/viewer'
          ]
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      } else {
        // 404 Not Found
        return new Response(JSON.stringify({
          success: false,
          message: 'Endpoint not found',
          error: `Path ${pathname} does not exist`
        }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    } catch (error) {
      // Global error handler
      console.error('Global error handler:', error);
      return new Response(JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
};
