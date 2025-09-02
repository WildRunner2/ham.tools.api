// Custom validation for Cloudflare Workers
// Replaces Joi which doesn't work in Workers environment

export interface ValidationResult {
  error?: {
    details: { message: string }[];
  };
  value?: any;
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Callsign validation (amateur radio callsign format)
export function validateCallsign(callsign: string): boolean {
  // Basic callsign format: prefix (optional) + number + suffix
  const callsignRegex = /^[A-Z0-9]{1,3}[0-9][A-Z0-9]{0,3}[A-Z]$/i;
  return callsignRegex.test(callsign);
}

// Password validation
export function validatePassword(password: string): boolean {
  return Boolean(password && password.length >= 6);
}

// User registration validation
export const userRegistrationSchema = {
  validate(data: any): ValidationResult {
    const errors: string[] = [];
    
    if (!data.callsign || typeof data.callsign !== 'string') {
      errors.push('Callsign is required');
    } else if (!validateCallsign(data.callsign)) {
      errors.push('Invalid callsign format');
    }
    
    if (!data.email || typeof data.email !== 'string') {
      errors.push('Email is required');
    } else if (!validateEmail(data.email)) {
      errors.push('Invalid email format');
    }
    
    if (!data.password || typeof data.password !== 'string') {
      errors.push('Password is required');
    } else if (!validatePassword(data.password)) {
      errors.push('Password must be at least 6 characters long');
    }
    
    if (!data.firstName || typeof data.firstName !== 'string') {
      errors.push('First name is required');
    }
    
    if (!data.lastName || typeof data.lastName !== 'string') {
      errors.push('Last name is required');
    }
    
    if (errors.length > 0) {
      return {
        error: {
          details: errors.map(msg => ({ message: msg }))
        }
      };
    }
    
    return {
      value: {
        callsign: data.callsign.toUpperCase().trim(),
        email: data.email.toLowerCase().trim(),
        password: data.password,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim()
      }
    };
  }
};

// User login validation
export const userLoginSchema = {
  validate(data: any): ValidationResult {
    const errors: string[] = [];
    
    if (!data.callsign || typeof data.callsign !== 'string') {
      errors.push('Callsign is required');
    }
    
    if (!data.password || typeof data.password !== 'string') {
      errors.push('Password is required');
    }
    
    if (errors.length > 0) {
      return {
        error: {
          details: errors.map(msg => ({ message: msg }))
        }
      };
    }
    
    return {
      value: {
        callsign: data.callsign.toUpperCase().trim(),
        password: data.password
      }
    };
  }
};

// Photo upload validation
export const photoUploadSchema = {
  validate(data: any): ValidationResult {
    const errors: string[] = [];
    
    if (!data.title || typeof data.title !== 'string') {
      errors.push('Photo title is required');
    } else if (data.title.length > 100) {
      errors.push('Title must be less than 100 characters');
    }
    
    if (data.description && typeof data.description !== 'string') {
      errors.push('Description must be a string');
    } else if (data.description && data.description.length > 500) {
      errors.push('Description must be less than 500 characters');
    }
    
    if (data.tags && !Array.isArray(data.tags)) {
      errors.push('Tags must be an array');
    } else if (data.tags && data.tags.length > 10) {
      errors.push('Maximum 10 tags allowed');
    }
    
    if (data.isPublic !== undefined && typeof data.isPublic !== 'boolean') {
      errors.push('isPublic must be a boolean');
    }
    
    if (errors.length > 0) {
      return {
        error: {
          details: errors.map(msg => ({ message: msg }))
        }
      };
    }
    
    return {
      value: {
        title: data.title.trim(),
        description: data.description ? data.description.trim() : '',
        tags: data.tags || [],
        isPublic: data.isPublic !== undefined ? data.isPublic : true
      }
    };
  }
};

// Iframe config validation
export const iframeConfigSchema = {
  validate(data: any): ValidationResult {
    const errors: string[] = [];
    
    if (!data.name || typeof data.name !== 'string') {
      errors.push('Configuration name is required');
    } else if (data.name.length > 50) {
      errors.push('Name must be less than 50 characters');
    }
    
    if (!data.photoIds || !Array.isArray(data.photoIds)) {
      errors.push('Photo IDs must be an array');
    } else if (data.photoIds.length === 0) {
      errors.push('At least one photo must be selected');
    } else if (data.photoIds.length > 20) {
      errors.push('Maximum 20 photos allowed');
    }
    
    if (!data.settings || typeof data.settings !== 'object') {
      errors.push('Settings object is required');
    }
    
    if (errors.length > 0) {
      return {
        error: {
          details: errors.map(msg => ({ message: msg }))
        }
      };
    }
    
    const settings = {
      width: Math.min(Math.max(data.settings.width || 600, 300), 1200),
      height: Math.min(Math.max(data.settings.height || 400, 200), 800),
      autoPlay: data.settings.autoPlay !== undefined ? data.settings.autoPlay : true,
      interval: Math.min(Math.max(data.settings.interval || 5000, 1000), 10000),
      showTitles: data.settings.showTitles !== undefined ? data.settings.showTitles : true,
      showControls: data.settings.showControls !== undefined ? data.settings.showControls : true,
      borderRadius: Math.min(Math.max(data.settings.borderRadius || 8, 0), 20),
      backgroundColor: data.settings.backgroundColor || '#1e1e1e'
    };
    
    return {
      value: {
        name: data.name.trim(),
        photoIds: data.photoIds,
        settings,
        isPublic: data.isPublic !== undefined ? data.isPublic : false
      }
    };
  }
};
