import { createRoot } from 'react-dom/client';

// Fonts are bundled locally (no runtime CDN), every declaration uses font-display: swap.
import '@fontsource-variable/manrope'; // UI + body copy
import '@fontsource/ibm-plex-mono/400.css'; // Section labels
import '@fontsource-variable/fraunces'; // editorial serif (roman), marquee
import '@fontsource-variable/fraunces/wght-italic.css'; // editorial serif italic, hero emphasis
import './styles/satoshi.css'; // heavy Satoshi, wordmark, headings, key letters
import './index.css';
import './styles/keyboard.css';
import './styles/marquee.css';

import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
