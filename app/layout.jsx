import './globals.css';
import { Inter, Playfair_Display } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata = {
  title: 'Atelier de Interiores — Questionário de Design',
  description:
    'Descubra o seu estilo de interiores com o nosso questionário interactivo passo a passo.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-stone-50 text-stone-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
