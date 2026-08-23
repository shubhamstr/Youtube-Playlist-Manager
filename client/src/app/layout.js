import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'YouTube Playlist Manager',
  description: 'Manage, organize, and filter YouTube playlists seamlessly.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
