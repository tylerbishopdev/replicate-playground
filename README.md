# Replicate Playground

A comprehensive Next.js application that serves as a dynamic playground for any model on Replicate. Users can browse models, generate dynamic input forms from OpenAPI schemas, submit predictions, and receive outputs in real-time through Server-Sent Events or webhooks.

## ✨ Features

### Core Functionality
- **Model Catalog**: Browse and search through Replicate's public model catalog
- **Dynamic Forms**: Auto-generate input forms from model OpenAPI schemas
- **File Uploads**: Support for images, audio, video, and other media with secure storage
- **Real-time Updates**: Server-Sent Events for live prediction status updates
- **Webhook Support**: Secure webhook handling for async prediction results
- **Streaming Support**: Real-time streaming for compatible models

### Security & Performance
- **Server-side API Proxy**: All Replicate API calls proxied through secure backend routes
- **Input Validation**: Comprehensive validation using Zod schemas
- **File Security**: Secure file upload with type/size validation
- **Rate Limiting**: Built-in rate limiting for API endpoints
- **XSS Protection**: Input sanitization and CSRF protection

### Developer Experience
- **TypeScript**: Full type safety throughout the application
- **Modular Design**: Easy to extend for additional providers (fal.ai, Hugging Face, etc.)
- **Comprehensive Testing**: Unit tests and E2E tests included
- **Documentation**: Detailed code comments and setup guides

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Replicate API token
- (Optional) Vercel Blob storage token for file uploads

### Installation

1. Clone and install dependencies:
```bash
git clone <repository-url>
cd replicate-playground
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your API keys:
```env
REPLICATE_API_TOKEN=your_replicate_api_token_here
WEBHOOK_SECRET=your_webhook_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
BLOB_READ_WRITE_TOKEN=your_blob_token_here
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
├── app/                          # Next.js App Router
│   ├── api/                      # API route handlers
│   │   ├── models/               # Model catalog endpoints
│   │   ├── predictions/          # Prediction management
│   │   ├── upload/               # File upload handling
│   │   └── webhooks/             # Webhook receivers
│   ├── models/[owner]/[name]/    # Model detail pages
│   └── page.tsx                  # Home page (model catalog)
├── components/                   # React components
│   ├── model-card.tsx            # Model display card
│   ├── dynamic-form.tsx          # Auto-generated forms
│   └── prediction-output.tsx     # Output display
├── lib/                          # Core utilities
│   ├── types.ts                  # TypeScript definitions
│   ├── utils.ts                  # Helper functions
│   ├── replicate.ts              # Replicate API client
│   ├── schema-parser.ts          # OpenAPI schema parser
│   └── security.ts               # Security utilities
├── hooks/                        # Custom React hooks
│   └── use-stream.ts             # SSE handling
└── __tests__/                    # Test files
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `REPLICATE_API_TOKEN` | Yes | Your Replicate API token |
| `WEBHOOK_SECRET` | Recommended | Secret for webhook signature validation |
| `NEXT_PUBLIC_APP_URL` | Yes | Your app's public URL (for webhooks) |
| `BLOB_READ_WRITE_TOKEN` | Optional | Vercel Blob storage token for file uploads |

### Getting API Keys

#### Replicate API Token
1. Sign up at [replicate.com](https://replicate.com)
2. Go to [Account Settings](https://replicate.com/account/api-tokens)
3. Create a new API token
4. Copy the token to your `.env.local` file

#### Vercel Blob Storage (Optional)
1. Deploy to Vercel or create a Vercel account
2. Go to your project settings
3. Create a new Blob store
4. Copy the `BLOB_READ_WRITE_TOKEN` to your `.env.local` file

### Webhook Setup

For production deployments, configure webhooks:

1. Set `WEBHOOK_SECRET` to a secure random string
2. Ensure your app is accessible at `NEXT_PUBLIC_APP_URL`
3. Webhooks will be received at `{NEXT_PUBLIC_APP_URL}/api/webhooks/replicate`

## 🎯 Usage

### Running Models

1. **Browse Models**: Use the search functionality on the home page
2. **Select Model**: Click on any model card to view details
3. **Fill Parameters**: The form is auto-generated from the model's schema
4. **Upload Files**: Drag and drop or select files for media inputs
5. **Run Prediction**: Click "Run Prediction" to start
6. **View Results**: Watch real-time updates and final outputs

### File Uploads

The app supports various file types:
- **Images**: JPEG, PNG, GIF, WebP
- **Videos**: MP4, WebM
- **Audio**: MP3, WAV, OGG
- **Documents**: PDF, TXT

Files are uploaded to Vercel Blob storage and passed as URLs to models.

### Streaming vs Async

- **Async Mode**: Default mode using webhooks for status updates
- **Streaming Mode**: Real-time output streaming for compatible models
- Toggle streaming in the model interface settings

## 🧪 Testing

Run the test suite:

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

## 🔒 Security Features

### Input Validation
- Zod schemas for runtime validation
- OpenAPI schema compliance checking
- File type and size validation
- URL and JSON validation

### API Security
- Server-side API key management
- Webhook signature verification
- Rate limiting on endpoints
- CSRF protection
- XSS prevention through input sanitization

### File Upload Security
- File type allowlisting
- Size limitations (50MB default)
- Secure storage with public URLs

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Docker

```bash
# Build image
docker build -t replicate-playground .

# Run container
docker run -p 3000:3000 --env-file .env.local replicate-playground
```

## 🛠 Extending the Application

### Adding New Providers

The application is designed for easy extension to support additional AI providers:

1. **Create Provider Interface**: Implement the `ModelProvider` interface in `lib/types.ts`
2. **Add API Routes**: Create new route handlers following the existing pattern
3. **Update UI**: Extend components to handle provider-specific features

Example provider structure:
```typescript
class FalAIProvider implements ModelProvider {
  name = 'fal.ai';

  async getModels(query?: string, cursor?: string) {
    // Implementation
  }

  async createPrediction(params: any) {
    // Implementation
  }

  // ... other methods
}
```

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Replicate](https://replicate.com) for the API and model hosting
- [Next.js](https://nextjs.org) for the application framework
- [Tailwind CSS](https://tailwindcss.com) for the styling system
- [Lucide](https://lucide.dev) for the icon system

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS.
