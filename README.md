# CodeBlog - Complete Blog Management System

A comprehensive blog management system built with React (Next.js) frontend and PHP backend, featuring user authentication, real-time chat, admin panel, and more.

## Features

### 🔐 Authentication System
- User registration with email verification
- Secure login with captcha protection
- Session management with tokens
- Password hashing and security

### 📝 Blog Management
- Create, read, update, delete posts
- Image upload support
- Hashtag system
- Search functionality
- Like and comment system
- View tracking

### 💬 Real-time Chat
- User-to-user messaging
- Real-time message updates
- Unread message indicators
- User search functionality

### 👨‍💼 Admin Panel
- Complete admin dashboard
- User management
- Post management
- Contact message handling
- System statistics

### 🎨 Modern UI/UX
- Dark/Light mode toggle
- Responsive design
- Mobile-friendly interface
- Beautiful animations
- Accessible components

### 🔒 Security Features
- Image captcha system
- SQL injection protection
- XSS protection
- CSRF protection
- Input sanitization

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Shadcn/ui** - UI components
- **Lucide React** - Icons

### Backend
- **PHP 8+** - Server-side logic
- **MySQL** - Database
- **PDO** - Database abstraction
- **PHPMailer** - Email functionality

## Installation

### Prerequisites
- Node.js 18+ and npm/pnpm
- PHP 8.0+
- MySQL 5.7+
- Web server (Apache/Nginx)

### Setup Instructions

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd blog-system
   \`\`\`

2. **Install frontend dependencies**
   \`\`\`bash
   npm install
   # or
   pnpm install
   \`\`\`

3. **Database Setup**
   - Create a MySQL database named `blog_system`
   - Run the database setup script:
   \`\`\`bash
   php scripts/dbstarter.php
   \`\`\`
   This will create all necessary tables and a default admin user.

4. **Configure Database Connection**
   Edit `api/config.php` with your database credentials:
   \`\`\`php
   private $host = 'localhost';
   private $dbname = 'blog_system';
   private $username = 'your_username';
   private $password = 'your_password';
   \`\`\`

5. **Email Configuration**
   Edit `api/email-verification.php` with your SMTP settings:
   \`\`\`php
   $mail->Host = 'smtp.gmail.com';
   $mail->Username = 'your-email@gmail.com';
   $mail->Password = 'your-app-password';
   \`\`\`

6. **Create Upload Directory**
   \`\`\`bash
   mkdir public/uploads
   chmod 755 public/uploads
   \`\`\`

7. **Start Development Server**
   \`\`\`bash
   npm run dev
   # or
   pnpm dev
   \`\`\`

8. **Setup Web Server**
   Configure your web server to serve the PHP files from the `api/` directory.

## Static Export Deployment

This system supports static HTML export for the frontend, allowing you to deploy the frontend and backend separately.

### Frontend (Static HTML)

1. **Configure API URL**
   Create a `.env.local` file in the root directory:
   \`\`\`env
   NEXT_PUBLIC_API_URL=https://yourdomain.com/api
   \`\`\`

2. **Build Static Site**
   \`\`\`bash
   npm run build
   \`\`\`
   This generates static HTML files in the `out/` directory.

3. **Deploy Frontend**
   Upload the contents of the `out/` directory to any static hosting service:
   - Netlify
   - Vercel
   - GitHub Pages
   - AWS S3
   - Any web hosting provider

### Backend (PHP API)

1. **Upload PHP Files**
   Upload the following to your web server:
   - `api/` directory
   - `panel.php` (admin panel)
   - `uploads/` directory (create if doesn't exist)

2. **Configure Database**
   Update `api/config.php` with your production database credentials.

3. **Set Permissions**
   \`\`\`bash
   chmod 755 uploads/
   chmod 644 api/*.php
   \`\`\`

4. **Test API**
   Verify your API is working by visiting:
   \`\`\`
   https://yourdomain.com/api/api.php?action=posts
   \`\`\`

### Example Deployment Structure

\`\`\`
Frontend (Static): https://myblog.netlify.app
Backend (PHP):     https://api.myblog.com/api/
Admin Panel:       https://api.myblog.com/panel.php
\`\`\`

## Default Admin Account

After running the database setup script, you can login with:
- **Username:** admin
- **Password:** admin123
- **Email:** admin@blog.com

**Important:** Change the default admin password after first login!

## File Structure

\`\`\`
blog-system/
├── app/                    # Next.js app directory
│   ├── chat/              # Chat functionality
│   ├── contact/           # Contact form
│   ├── post/[id]/         # Individual post pages
│   ├── profile/[username]/ # User profiles
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── api/                   # PHP backend
│   ├── api.php           # Main API endpoints
│   ├── captcha.php       # Captcha generation
│   ├── config.php        # Database configuration
│   └── email-verification.php # Email handling
├── components/           # React components
│   ├── ui/              # Shadcn/ui components
│   └── theme-provider.tsx # Theme management
├── lib/                 # Utility libraries
│   └── api-config.ts    # API configuration
├── scripts/             # Database scripts
│   └── dbstarter.php    # Database setup
├── public/              # Static files
│   └── uploads/         # User uploaded files
├── out/                 # Generated static files (after build)
├── panel.php            # Admin panel
└── next.config.mjs      # Next.js configuration
\`\`\`

## API Endpoints

### Authentication
- `POST /api/api.php?action=register` - User registration
- `POST /api/api.php?action=verify-email` - Email verification
- `POST /api/api.php?action=login` - User login

### Posts
- `GET /api/api.php?action=posts` - Get posts list
- `GET /api/api.php?action=post&id={id}` - Get single post
- `POST /api/api.php?action=like` - Like/unlike post

### Comments
- `GET /api/api.php?action=comments&post_id={id}` - Get comments
- `POST /api/api.php?action=comments` - Add comment

### Chat
- `GET /api/api.php?action=chat-users` - Get chat users
- `GET /api/api.php?action=chat-messages&user_id={id}` - Get messages
- `POST /api/api.php?action=send-message` - Send message

### Contact
- `POST /api/api.php?action=contact` - Send contact message

### Profile
- `GET /api/api.php?action=profile&username={username}` - Get user profile

## Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `email` - User email
- `password` - Hashed password
- `avatar` - Profile picture
- `bio` - User biography
- `is_admin` - Admin flag
- `is_verified` - Email verification status

### Posts Table
- `id` - Primary key
- `title` - Post title
- `slug` - URL slug
- `content` - Post content
- `image` - Featured image
- `hashtags` - Comma-separated tags
- `author_id` - Foreign key to users
- `status` - Draft/published
- `views` - View count

### Additional Tables
- `likes` - Post likes
- `comments` - Post comments
- `chat_messages` - Chat messages
- `contact_messages` - Contact form submissions
- `email_verifications` - Email verification codes
- `user_sessions` - User sessions

## Security Features

1. **Input Sanitization** - All user inputs are sanitized
2. **Password Hashing** - Bcrypt password hashing
3. **SQL Injection Protection** - Prepared statements
4. **XSS Protection** - Output escaping
5. **CSRF Protection** - Token validation
6. **Session Security** - Secure session management
7. **Captcha Protection** - Image captcha for forms
8. **Email Verification** - Required for registration

## Customization

### Themes
The system supports dark/light mode switching. Customize colors in `app/globals.css`.

### Email Templates
Modify email templates in `api/email-verification.php`.

### Admin Panel
Customize the admin panel by editing `panel.php`.

### UI Components
All UI components are in `components/ui/` and can be customized.

## Deployment Options

### Option 1: Traditional Hosting
Deploy both frontend and backend on the same server with PHP support.

### Option 2: Separate Hosting (Recommended)
- **Frontend**: Static hosting (Netlify, Vercel, GitHub Pages)
- **Backend**: PHP hosting (shared hosting, VPS, cloud)

### Option 3: Full Stack Hosting
Deploy to platforms that support both Node.js and PHP (some VPS providers).

## Environment Variables

### Frontend (.env.local)
\`\`\`env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
\`\`\`

### Backend (api/config.php)
\`\`\`php
private $host = 'localhost';
private $dbname = 'blog_system';
private $username = 'your_username';
private $password = 'your_password';
\`\`\`

## Build Commands

\`\`\`bash
# Development
npm run dev

# Build for production (static export)
npm run build

# Start production server (if not using static export)
npm start

# Type checking
npm run type-check

# Linting
npm run lint
\`\`\`

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check `NEXT_PUBLIC_API_URL` environment variable
   - Verify backend is accessible
   - Check CORS settings

2. **Database Connection Error**
   - Verify database credentials in `api/config.php`
   - Ensure database exists and is accessible
   - Check PHP PDO extension is installed

3. **Upload Issues**
   - Check `uploads/` directory permissions (755)
   - Verify PHP upload settings
   - Check file size limits

4. **Email Not Sending**
   - Verify SMTP settings in `api/email-verification.php`
   - Check firewall/hosting provider restrictions
   - Test with different email providers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For support and questions:
- Create an issue on GitHub
- Email: support@codeblog.uz
- Documentation: Check the code comments

## Changelog

### Version 1.1.0
- Added static export support
- Separated frontend and backend deployment
- Enhanced API configuration
- Improved error handling
- Updated documentation

### Version 1.0.0
- Initial release
- Complete blog system
- User authentication
- Real-time chat
- Admin panel
- Mobile responsive design
- Dark/light mode
- Security features

---

**Built with ❤️ using Next.js and PHP**
