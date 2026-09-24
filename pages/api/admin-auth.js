export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (password === adminPassword) {
    return res.status(200).json({ authenticated: true });
  }

  return res.status(401).json({ authenticated: false, error: 'Palavra-passe incorreta' });
}
