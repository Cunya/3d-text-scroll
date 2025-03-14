# 3D Text Scroll

A visually stunning 3D text scrolling effect created with Three.js. This project features scrolling 3D text with dramatic lighting effects that highlight the text as it moves across the screen.

## Live Demo

You can view the live demo [here](https://yourusername.github.io/3d-text-scroll/).

## Features

- Scrolling 3D text with realistic lighting
- Multiple light sources creating dramatic effects:
  - Center spotlight (white)
  - Side lights (blue)
  - Back light (yellow/amber)
  - Hair light from above (white)
- Interactive controls panel to adjust lighting settings
- Orbit controls to view the scene from different angles
- Responsive design that works on various screen sizes

## Controls

- Click the "Show Controls" button in the top-right corner to access the lighting controls
- Adjust the intensity and color of each light source
- Use the "Save Settings to Console" button to output current settings to the browser console
- Click and drag to orbit around the scene
- Scroll to zoom in and out

## Technologies Used

- Three.js for 3D rendering
- JavaScript ES6+
- HTML5 & CSS3

## Setup for Local Development

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/3d-text-scroll.git
   ```

2. Navigate to the project directory:
   ```
   cd 3d-text-scroll
   ```

3. Serve the files using a local server. You can use any of these methods:
   - Using Python:
     ```
     python -m http.server
     ```
   - Using Node.js and npx:
     ```
     npx serve
     ```
   - Using VS Code's Live Server extension

4. Open your browser and navigate to `http://localhost:8000` (or whatever port your server is using)

## Deployment to GitHub Pages

1. Push your code to a GitHub repository
2. Go to the repository settings
3. Scroll down to the GitHub Pages section
4. Select the branch you want to deploy (usually `main` or `master`)
5. Click Save
6. Your site will be published at `https://yourusername.github.io/3d-text-scroll/`

## Customization

You can customize the text by modifying the `scrollText` variable in `main.js`. You can also adjust the initial lighting settings by changing the parameters in the `createSpotLight` function calls.

## License

MIT

## Acknowledgements

- Three.js for the amazing 3D library
- The Three.js community for examples and inspiration 