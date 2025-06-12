require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const CONTEXTO = `
Você é um atendente virtual da livraria 'LivroLivre'.
Responda de forma educada e clara dúvidas sobre:
- livros em estoque,
- pedidos realizados,
- prazos e formas de entrega.

Se a pergunta for fora desse contexto, informe que não pode responder.
`;

app.post('/perguntar', async (req, res) => {
  const { pergunta } = req.body;

  if (!pergunta) {
    return res.status(400).json({ erro: 'Pergunta não fornecida.' });
  }

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'mistralai/mistral-7b-instruct', // gratuito e rápido
        messages: [
          { role: 'system', content: CONTEXTO },
          { role: 'user', content: pergunta }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const resposta = response.data.choices[0].message.content;
    res.json({ resposta });

  } catch (error) {
    console.error('Erro na chamada à API:', error.response?.data || error.message);
    res.status(500).json({ erro: 'Erro ao consultar modelo LLM.' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando em http://localhost:${process.env.PORT}`);
});

app.get('/', (req, res) => {
    res.send('🚀 API de LLM está rodando. Use POST /perguntar para enviar perguntas.');
  });
