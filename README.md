# Sign Language to Text Converter

A real-time web application that converts American Sign Language (ASL) gestures to text using MediaPipe hand detection and computer vision.

## 🌟 Features

- **Real-time Recognition**: Instant conversion of ASL gestures to text
- **Hand Landmark Detection**: Uses Google's MediaPipe for accurate hand tracking
- **Multiple Gesture Support**: Recognizes common ASL letters (A-Z)
- **Text Management**: Copy, download, and edit recognized text
- **Responsive Design**: Works on desktop and mobile devices
- **No Installation Required**: Runs directly in the browser

## 🚀 Live Demo

Visit the deployed application: [Sign Language Converter](https://your-app-name.onrender.com)

## 📦 Deployment on Render

This application is ready for deployment on Render.com:

### Quick Deploy to Render:

1. **Fork/Clone this repository**
   ```bash
   git clone https://github.com/your-username/sign-language-converter.git
   cd sign-language-converter
   ```

2. **Push to your GitHub repository**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

3. **Deploy on Render**
   - Go to [Render.com](https://render.com)
   - Click "New" → "Static Site"
   - Connect your GitHub repository
   - Use these settings:
     - **Build Command**: `echo "No build required"`
     - **Publish Directory**: `.` (current directory)
   - Click "Create Static Site"

### Alternative: Manual Upload

1. Download the ZIP file from this repository
2. Upload directly to Render using their dashboard upload feature

## 🛠️ Local Development

To run locally:

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/sign-language-converter.git
   cd sign-language-converter
   ```

2. **Start a local server**
   ```bash
   # Using Python 3
   python -m http.server 3000

   # Using Python 2
   python -m SimpleHTTPServer 3000

   # Using Node.js
   npx serve .
   ```

3. **Open in browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
sign-language-converter/
├── index.html          # Main application file
├── style.css          # Application styling
├── app.js             # Main application logic
├── package.json       # Project configuration
├── README.md          # This file
├── .gitignore         # Git ignore rules
└── assets/           # Additional assets (if any)
```

## 🎯 How to Use

1. **Grant Camera Permission**: Allow the browser to access your webcam
2. **Start Recognition**: Click the "Start Recognition" button
3. **Make Gestures**: Perform ASL letters in front of the camera
4. **View Results**: Recognized text appears in the output area
5. **Manage Text**: Use copy, download, or clear functions as needed

## 🤝 Supported Gestures

Currently supports the following ASL letters:
- A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z

## 🔧 Technical Details

### Dependencies
- **MediaPipe Hands**: Google's hand landmark detection
- **HTML5 Canvas**: For video rendering and landmark visualization
- **JavaScript ES6**: Modern JavaScript features
- **CSS3**: Responsive design and animations

### Browser Requirements
- Chrome 88+ (recommended)
- Firefox 85+
- Safari 14+
- Edge 88+

### Camera Requirements
- Webcam access required
- Good lighting conditions recommended
- Clear hand visibility needed

## 🐛 Troubleshooting

### Camera Issues
- Ensure camera permissions are granted
- Check if other applications are using the camera
- Try refreshing the page

### Recognition Issues
- Ensure good lighting
- Keep hand clearly visible
- Hold gestures steady for 1-2 seconds
- Make sure hand is within the camera frame

### Performance Issues
- Close other browser tabs using camera
- Restart the browser
- Check system resources

## 🚀 Deployment Options

### Render.com (Recommended)
- Easy deployment from GitHub
- Free tier available
- Automatic deployments
- Custom domains supported

### Other Platforms
- **Netlify**: Drag and drop deployment
- **GitHub Pages**: Free hosting for public repos
- **Vercel**: Serverless deployment
- **Firebase Hosting**: Google's hosting solution

## 📝 Environment Variables

No environment variables required - this is a client-side only application.

## 🔒 Privacy & Security

- All processing happens locally in the browser
- No data is sent to external servers
- Camera access is only used for gesture recognition
- No personal data is stored or transmitted

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google MediaPipe team for the hand detection model
- The ASL community for gesture references
- Contributors and testers

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the troubleshooting section above
- Review browser console for error messages

---

Made with ❤️ for the deaf and hard-of-hearing community
