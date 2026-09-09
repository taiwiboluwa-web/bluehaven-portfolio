import { describe, expect, it } from 'vitest';
import storageFunction from '../neon/functions/portfoliostorage.mjs';

describe('Neon portfolio storage function', () => {
  it('answers browser CORS preflight without crashing a 204 response', async () => {
    const request = new Request('https://storage.example.test/', {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://www.bluehavens.name.ng',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,x-bluehaven-token',
      },
    });

    const response = await storageFunction.fetch(request);

    expect(response.status).toBe(204);
    expect(response.headers.get('access-control-allow-origin')).toBe('https://www.bluehavens.name.ng');
    expect(response.headers.get('access-control-allow-methods')).toContain('POST');
    expect(response.headers.get('access-control-allow-headers')).toContain('x-bluehaven-token');
    expect(await response.text()).toBe('');
  });
});
