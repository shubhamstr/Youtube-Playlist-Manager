import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'YouTube Playlist Manager',
  description: 'Manage, organize, and filter YouTube playlists seamlessly.',
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
