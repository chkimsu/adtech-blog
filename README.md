# Ad Tech Blog

A modern, dark-mode focused blog about Ad Tech, built with vanilla HTML, CSS, and JavaScript. Perfect for sharing insights on programmatic advertising, RTB, analytics, and privacy compliance.

![Ad Tech Blog](https://img.shields.io/badge/Built%20with-HTML%2FCSS%2FJS-blue)
![GitHub Pages](https://img.shields.io/badge/Hosted%20on-GitHub%20Pages-green)

## ✨ Features

- 🎨 **Modern Dark Mode Design** - Sleek glassmorphism UI with smooth animations
- 🔍 **Real-time Search** - Instantly filter posts by title, content, or keywords
- 🏷️ **Category & Tag Filtering** - Organize and discover content easily
- 🌓 **Theme Toggle** - Switch between dark and light modes (persisted in localStorage)
- 💬 **GitHub Comments** - Utterances integration for privacy-friendly discussions
- 📱 **Fully Responsive** - Works perfectly on desktop, tablet, and mobile
- ⚡ **Fast & Lightweight** - No frameworks, pure vanilla JavaScript
- 🔒 **Privacy-First** - No tracking, no analytics by default

## 📂 Project Structure

```
adtech-blog/
├── index.html              # Home page with blog listing
├── post.html              # Blog post detail template
├── about.html             # About page
├── css/
│   └── style.css         # Main stylesheet with dark mode
├── js/
│   ├── main.js           # Core functionality (search, filter, theme)
│   └── posts.js          # Blog posts data
├── posts/                # (Optional) Individual post HTML files
├── assets/
│   └── images/          # Blog images and assets
└── README.md
```

## 🚀 Quick Start

### Local Development

1. Clone this repository:
```bash
git clone https://github.com/yourusername/adtech-blog.git
cd adtech-blog
```

2. Start a local server:
```bash
# Using Python 3
python3 -m http.server 8000

# Or using Python 2
python -m SimpleHTTPServer 8000

# Or using Node.js http-server
npx http-server -p 8000
```

3. Open your browser to `http://localhost:8000`

### Deploy to GitHub Pages

1. **Create a new GitHub repository** (e.g., `adtech-blog`)

2. **Initialize and push your code:**
```bash
cd adtech-blog
git init
git add .
git commit -m "Initial commit: Ad Tech Blog"
git branch -M main
git remote add origin https://github.com/yourusername/adtech-blog.git
git push -u origin main
```

3. **Enable GitHub Pages:**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Under "Source", select `main` branch and `/ (root)` folder
   - Click "Save"

4. **Your site will be live at:** `https://yourusername.github.io/adtech-blog/`

## 💬 Setting Up Comments

This blog uses [Utterances](https://utteranc.es/) for GitHub-based comments.

1. **Install the Utterances app:**
   - Visit https://github.com/apps/utterances
   - Click "Install"
   - Select your `adtech-blog` repository

2. **Update the configuration in `js/main.js`:**
   - Open `js/main.js`
   - Find the `initializeComments` function
   - Uncomment and update the utterances script:
   ```javascript
   script.setAttribute('repo', 'yourusername/adtech-blog'); // Change this
   ```

3. **Comments will now appear at the bottom of each blog post!**

## ✍️ Adding New Posts

### Method 1: Edit posts.js (Recommended)

Add a new post object to the `posts` array in `js/posts.js`:

```javascript
{
  id: 'your-post-slug',
  title: 'Your Post Title',
  excerpt: 'A brief description of your post',
  date: '2026-01-15',
  readTime: '10 min read',
  categories: ['Category1', 'Category2'],
  tags: ['tag1', 'tag2', 'tag3'],
  content: `
    <h2>Your Post Content</h2>
    <p>Write your content here using HTML...</p>
  `
}
```

### Method 2: Markdown Conversion

If you prefer writing in Markdown:

1. Write your post in Markdown
2. Use a converter like [markdowntohtml.com](https://markdowntohtml.com/)
3. Copy the HTML output into the `content` field

## 🎨 Customization

### Change Colors

Edit CSS variables in `css/style.css`:

```css
:root {
  --accent-primary: #00e5ff;      /* Primary accent color */
  --accent-secondary: #b026ff;    /* Secondary accent */
  --bg-primary: #0a0e27;         /* Main background */
  /* ... more variables */
}
```

### Modify Typography

Update Google Fonts import in `css/style.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Your+Font&display=swap');

body {
  font-family: 'Your Font', sans-serif;
}
```

### Update Blog Title

Edit the logo in HTML files:

```html
<div class="logo">Your Blog Name</div>
```

And update the hero section in `index.html`:

```html
<h1>Your Blog Title</h1>
<p>Your blog description</p>
```

## 📱 Responsive Breakpoints

The design is mobile-first with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔧 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 Sample Content

The blog comes with 4 sample posts covering:
1. Introduction to Programmatic Advertising
2. Real-Time Bidding (RTB) Deep Dive
3. Ad Analytics & Attribution
4. Privacy & Compliance in Ad Tech

Feel free to replace these with your own content!

## 🤝 Contributing

This is a personal blog template, but suggestions are welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Design inspired by modern web design trends
- Built with ❤️ for the Ad Tech community
- Hosted on GitHub Pages (free!)

## 📞 Support

If you have questions or need help:
- Open an issue on GitHub
- Check existing issues for solutions
- Read the documentation in code comments

---

**Happy Blogging! 🚀**

Made with ❤️ for Ad Tech professionals
