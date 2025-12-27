const fs = require('fs');
const path = require('path');

// Create a simple SVG icon that can be converted to PNG
const createSVGIcon = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#5B7396"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size/4}" fill="white" text-anchor="middle" dy=".3em">EQ</text>
</svg>
`;

// Icon sizes needed
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log('Creating placeholder icons...');

// For now, let's create simple HTML files that can be renamed to PNG
// In a real scenario, you'd use a proper image generation library
sizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(__dirname, 'public', filename), svgContent);
  console.log(`Created ${filename}`);
});

console.log('Icons created! You should convert these SVG files to PNG format.');
console.log('You can use online tools like https://convertio.co/svg-png/ or install imagemagick.');