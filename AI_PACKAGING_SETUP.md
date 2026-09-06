# AI Packaging Generator - Setup Guide

## Overview

The AI Packaging Generator integrates real AI image generation APIs to create professional packaging mockups. It supports two providers:

- **OpenAI DALL-E 3** - Recommended for high-quality, creative outputs
- **Stability AI** - Advanced control with image-to-image capabilities

## Setup Instructions

### Step 1: Obtain API Keys

#### Option A: OpenAI DALL-E 3
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy the key (starts with `sk-...`)
6. **Pricing**: ~$0.040 per image for DALL-E 3 Standard, ~$0.080 for HD quality

#### Option B: Stability AI
1. Visit [Stability AI Platform](https://platform.stability.ai/account/keys)
2. Sign in or create an account
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Copy the key (starts with `sk-...`)
6. **Pricing**: ~$0.040 per image for SD3 Medium

### Step 2: Add API Key to Supabase

1. **Open Make Settings**
   - Click the settings icon in your Make interface
   - Or navigate to the Make settings page

2. **Access Supabase Configuration**
   - Scroll to **Supabase Edge Function Secrets** section
   - This is where you securely store API keys server-side

3. **Add Secret Key**
   - Click **Add Secret**
   - Enter the key name exactly as shown:
     - For OpenAI: `OPENAI_API_KEY`
     - For Stability AI: `STABILITY_API_KEY`
   - Paste your API key in the value field
   - Click **Save**

4. **Deploy Edge Function**
   - After adding the secret, click **Deploy** button
   - This updates the Supabase edge function with your new credentials
   - Wait for deployment confirmation (~30 seconds)

### Step 3: Test the Generator

1. **Upload a Logo**
   - Click or drag to upload your brand logo
   - Supported formats: PNG, JPG, SVG
   - Recommended: Transparent PNG for best results

2. **Select Packaging Type**
   - Choose from 10 packaging options: Bottle, Box, Pouch, Can, etc.

3. **Choose AI Provider**
   - Select OpenAI DALL-E 3 or Stability AI
   - Make sure you've added the corresponding API key

4. **Generate**
   - Click **Generate AI Mockup**
   - Wait 10-30 seconds for generation
   - Generated image will include Bluehaven Studios watermark

5. **Download**
   - Click **Download Mockup** to save the image
   - File format: PNG (1024×1792 for OpenAI, 1024×1792 for Stability)

## Technical Details

### API Endpoints

**Backend Endpoint**: `https://afkwlnaotfwnfwiqtkty.supabase.co/functions/v1/make-server-cf1ab75b/generate-packaging`

**Request Format**:
```json
{
  "logoBase64": "data:image/png;base64,...",
  "packagingType": "Bottle",
  "provider": "openai"
}
```

**Response Format**:
```json
{
  "success": true,
  "imageUrl": "https://...",
  "provider": "openai"
}
```

### Prompt Template

The AI uses this detailed prompt for professional packaging designs:

```
Using the provided logo image, create a Professional industrial design packaging 
illustration sheet for a {PACKAGE_TYPE} package. Centered hero 3D render with 
realistic materials, soft studio lighting, and commercial-quality finish. 
Surrounded by technical views: front, side, top, bottom, angled perspective, 
and flat lay. Include wireframe construction sketches, fold lines, seam details, 
and dimension arrows in millimeters. Show material and finish callouts (matte, 
glossy print, plastic, paper, glass, etc.) in handwritten annotations. Add color 
swatches, realistic product illustration, and subtle shadows. Clean off-white 
sketchbook background, hybrid realistic render + pencil sketch style, modern 
product design documentation layout, ultra-detailed, portfolio-ready.
```

### Provider Comparison

| Feature | OpenAI DALL-E 3 | Stability AI |
|---------|----------------|--------------|
| Image Quality | Excellent creative interpretation | High detail, technical control |
| Generation Time | 10-20 seconds | 15-30 seconds |
| Resolution | 1024×1792 (portrait) | 1024×1792 (9:16) |
| Logo Integration | Text-based prompt | Image-to-image transformation |
| Cost per Image | $0.04-$0.08 | ~$0.04 |
| Best For | Creative, artistic mockups | Technical, precise designs |

## Troubleshooting

### "Provider not configured" Error
- **Cause**: API key not added or incorrect key name
- **Solution**: 
  - Verify secret key name matches exactly: `OPENAI_API_KEY` or `STABILITY_API_KEY`
  - Re-deploy edge function after adding key
  - Check for typos in the API key

### "Failed to generate" Error
- **Cause**: Invalid API key, insufficient credits, or rate limit
- **Solution**:
  - Verify API key is active on provider dashboard
  - Check account balance/credits
  - Wait a few minutes and try again (rate limits)

### Slow Generation
- **Cause**: API provider server load
- **Solution**: Normal for AI generation (10-30 seconds is typical)

### Generated Image Not Displaying
- **Cause**: Network issue or CORS error
- **Solution**: Check browser console for errors, try refreshing

## Security Notes

⚠️ **Important Security Information**:

1. **API keys are stored server-side** in Supabase Edge Function environment variables
2. **Never expose API keys** in frontend code or commit them to version control
3. **Make is not designed** for collecting PII or storing sensitive user data
4. **Rate limiting**: Consider implementing usage limits for production deployments
5. **Cost monitoring**: Set up billing alerts on AI provider dashboards

## Advanced Configuration

### Custom Prompt Modifications

To modify the AI prompt, edit the backend endpoint in:
```
/workspaces/default/code/supabase/functions/server/index.tsx
```

Look for the `prompt` variable in the `/generate-packaging` endpoint.

### Adding New Providers

To add additional AI providers (e.g., Midjourney, Replicate):

1. Add new provider option to frontend selector
2. Add corresponding logic in backend endpoint
3. Add new environment secret to Supabase
4. Update documentation

### Image Post-Processing

The current implementation applies a Bluehaven Studios watermark automatically. To modify:

1. Edit watermark position in `AIPackagingGenerator.tsx`
2. Change opacity, size, or position via CSS
3. Replace watermark image asset

## Cost Estimation

**OpenAI DALL-E 3**:
- Standard quality: $0.040 per generation
- HD quality: $0.080 per generation
- 100 generations/month ≈ $4-8

**Stability AI**:
- SD3 Medium: ~$0.040 per generation  
- 100 generations/month ≈ $4

**Recommendation**: Start with OpenAI DALL-E 3 for best creative results, switch to Stability AI if you need more control or lower costs at scale.

## Support

For issues or questions:
- Check browser console for detailed error messages
- Verify API key configuration in Supabase settings
- Ensure edge function is deployed after adding secrets
- Review provider API documentation for status updates

---

**Last Updated**: April 2026
**Bluehaven Studios** - Business Registration: 9455932
