require('dotenv').config();

const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const ACCESS_KEY = process.env.WEB3FORMS_ACCESS_KEY;

if (!ACCESS_KEY) {
  console.error('Variável WEB3FORMS_ACCESS_KEY não encontrada no arquivo .env');
  process.exit(1);
}

app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: false, limit: '32kb' }));
app.use(express.static(path.join(__dirname)));

const INTEREST_LABELS = {
  apadrinhamento: 'Apadrinhamento de Natal',
  bazar: 'Doação para o Bazar Beneficente',
  voluntariado: 'Quero ser voluntário(a)',
  oficinas: 'Oficinas e projetos (esporte, música, arte, cultura)',
  doacao_financeira: 'Doação financeira / patrocínio',
  parceria: 'Parceria empresarial / institucional',
  materiais: 'Doação de materiais e equipamentos',
  outros: 'Outros',
};

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, interest, message, botcheck } = req.body || {};

    // Honeypot: bots preenchendo campos ocultos são rejeitados
    if (botcheck) {
      return res.status(200).json({ success: true, message: 'Mensagem enviada com sucesso.' });
    }

    const cleanName = String(name || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPhone = String(phone || '').trim();
    const cleanInterest = String(interest || '').trim();
    const cleanMessage = String(message || '').trim();

    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({ success: false, message: 'Informe um nome válido.' });
    }

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Informe um e-mail válido.' });
    }

    if (!cleanPhone || cleanPhone.length < 8) {
      return res.status(400).json({ success: false, message: 'Informe um telefone válido.' });
    }

    if (!INTEREST_LABELS[cleanInterest]) {
      return res.status(400).json({ success: false, message: 'Selecione uma área de interesse.' });
    }

    const interestLabel = INTEREST_LABELS[cleanInterest];
    const composedMessage = [
      `Área de interesse: ${interestLabel}`,
      `Telefone: ${cleanPhone}`,
      '',
      cleanMessage || 'Nenhuma mensagem adicional.',
    ].join('\n');

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: ACCESS_KEY,
        subject: `Nova colaboração: ${interestLabel}`,
        from_name: 'Site Projeto Vida',
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        interest: interestLabel,
        message: composedMessage,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return res.status(502).json({
        success: false,
        message: 'Não foi possível enviar sua mensagem agora. Tente novamente em instantes.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Mensagem enviada com sucesso! Em breve entraremos em contato.',
    });
  } catch (error) {
    console.error('Erro ao enviar formulário:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao processar o envio. Tente novamente mais tarde.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Projeto Vida rodando em http://localhost:${PORT}`);
});
