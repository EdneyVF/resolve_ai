require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDB = require('./config/db');
const { loginLimiter, generalLimiter, sanitize } = require('./config/security');
const errorHandler = require('./middlewares/errorMiddleware');
const routes = require('./routes');

// Não conectar ao DB automaticamente em ambiente de teste
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();
const port = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:5173',   // Desenvolvimento local
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsOptions = {
  origin: function (origin, callback) {

    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log('Origem bloqueada pelo CORS:', origin);
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization,X-Requested-With",
  credentials: true, // Permitir cookies em requisições cross-origin
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.json());
app.use(sanitize());
app.use(generalLimiter);

app.get('/api', (req, res) => {
  res.json({ message: "API do ResolveAí funcionando!" });
});

app.use('/api/auth', loginLimiter);

app.use(routes);

app.use(errorHandler);

// Não iniciar servidor automaticamente em ambiente de teste
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
}

module.exports = app;