import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Myanmar Calorie Tracker',
    short_name: 'CalTracker',
    description: 'Smart calorie tracking for Myanmar food',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#10b981',
    orientation: 'portrait',
    icons: [],
    categories: ['health', 'lifestyle', 'food'],
  };
}
