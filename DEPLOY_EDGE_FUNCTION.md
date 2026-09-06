# Deploy AI Packaging Edge Function

## Quick Fix for "Failed to fetch" and Deployment Errors

The "Failed to fetch" error occurs when the Supabase edge function isn't deployed yet. The deployment error with "ECONNREFUSED" has been fixed by removing unnecessary database dependencies. Here's how to deploy:

### Method 1: Deploy via Make Settings (Recommended)

1. **Open Make Settings**
   - Click the settings/gear icon in the Make interface
   - Or look for "Settings" in the top navigation

2. **Navigate to Supabase Section**
   - Find "Supabase Edge Function Secrets"
   - This is where you add API keys

3. **Add Your API Key**
   - Click "Add Secret"
   - Name: `OPENAI_API_KEY` (for OpenAI) or `STABILITY_API_KEY` (for Stability AI)
   - Value: Your API key (get it from [OpenAI](https://platform.openai.com/api-keys) or [Stability AI](https://platform.stability.ai/account/keys))

4. **Deploy the Function**
   - After adding the secret, click the **"Deploy"** button
   - Wait 30-60 seconds for deployment to complete
   - You should see a success message

5. **Test the Generator**
   - Go back to your app
   - Try generating a packaging design
   - The error should be resolved

### Method 2: Manual Deployment (Advanced)

If you have access to the Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref afkwlnaotfwnfwiqtkty

# Deploy the edge function
supabase functions deploy make-server-cf1ab75b

# Set environment secrets
supabase secrets set OPENAI_API_KEY=your_key_here
# OR
supabase secrets set STABILITY_API_KEY=your_key_here
```

## Verify Deployment

Test if the edge function is deployed:

Open this URL in your browser or use curl:
```
https://afkwlnaotfwnfwiqtkty.supabase.co/functions/v1/make-server-cf1ab75b/health
```

Or with curl:
```bash
curl -X GET https://afkwlnaotfwnfwiqtkty.supabase.co/functions/v1/make-server-cf1ab75b/health
```

Expected response:
```json
{"status":"ok"}
```

If you get this response, the function is deployed correctly!

**Note**: The edge function has been updated to remove database dependencies, so it should deploy cleanly now.

## Common Issues

### Issue: "Cannot connect to API server"
**Cause**: Edge function not deployed
**Solution**: Follow Method 1 above to deploy via Make settings

### Issue: "Provider 'openai' not configured"
**Cause**: API key not added to environment secrets
**Solution**: Add `OPENAI_API_KEY` or `STABILITY_API_KEY` in Make settings

### Issue: CORS errors in browser console
**Cause**: Edge function CORS headers not set
**Solution**: The function already has CORS enabled. Clear browser cache and try again.

### Issue: "401 Unauthorized" or "Invalid API key"
**Cause**: Wrong API key or insufficient credits
**Solution**: 
- Verify your API key is correct
- Check your account balance on OpenAI/Stability AI dashboard
- Make sure the key has the correct permissions

## Testing Without Deployment

If you can't deploy yet but want to test the UI, the component will show:
- Upload interface ✓
- Packaging type selection ✓
- Provider selection ✓
- Generate button ✓
- Error message when generation fails

The actual AI generation requires deployment and valid API keys.

---

**Need help?** Check the main setup guide in `AI_PACKAGING_SETUP.md`
