require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Report = require('../models/Report');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  try {
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    console.log(`MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Erro: ${error.message}`);
    process.exit(1);
  }
};

const clearData = async () => {
  try {
    await User.deleteMany({});
    await Category.deleteMany({});
    await Report.deleteMany({});
    console.log('Dados anteriores removidos com sucesso');
  } catch (error) {
    console.error(`Erro ao limpar dados: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {

    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const admin = await User.create({
      name: 'Administrador ResolveAí',
      email: 'admin@resolveai.com',
      password: adminPassword,
      role: 'admin',
      phone: '+55 85 91234-5678',
      bio: 'Administrador do sistema ResolveAí'
    });

    const user = await User.create({
      name: 'Usuário Teste',
      email: 'usuario@exemplo.com',
      password: userPassword,
      role: 'user',
      phone: '+55 11 91234-5678',
      bio: 'Usuário regular para testes'
    });

    console.log('Usuários criados com sucesso');

    const categories = await Category.insertMany([
      {
        name: 'Música',
        description: 'Relatos musicais como shows, concertos e festivais'
      },
      {
        name: 'Tecnologia',
        description: 'Conferências, workshops e meetups de tecnologia'
      },
      {
        name: 'Gastronomia',
        description: 'Festivais gastronômicos, degustações e workshops culinários'
      },
      {
        name: 'Esportes',
        description: 'Competições esportivas, maratonas e campeonatos'
      },
      {
        name: 'Educação',
        description: 'Cursos, palestras e workshops educacionais'
      }
    ]);

    console.log('Categorias criadas com sucesso');

    const today = new Date();

    await Report.create({
      title: 'Relato de Desenvolvimento Web',
      description: 'Aprenda as mais recentes tecnologias web neste workshop intensivo de 8 horas.',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30, 9, 0),
      location: {
        address: 'Av. Paulista, 1000',
        city: 'São Paulo',
        state: 'SP',
        country: 'Brasil'
      },
      category: categories[1]._id, // Tecnologia
      organizer: admin._id,
      tags: ['desenvolvimento', 'web', 'javascript', 'react'],
      approvalStatus: 'approved',
      approvedBy: admin._id,
      approvalDate: new Date()
    });

    await Report.create({
      title: 'Relato de Música Independente',
      description: 'Um dia inteiro de música independente com artistas locais e nacionais.',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 45, 14, 0),
      location: {
        address: 'Parque Ibirapuera',
        city: 'São Paulo',
        state: 'SP',
        country: 'Brasil'
      },
      category: categories[0]._id, // Música
      organizer: user._id,
      tags: ['música', 'festival', 'indie', 'cultura'],
      approvalStatus: 'pending'
    });

    await Report.create({
      title: 'Relato de Corrida Beneficente',
      description: 'Corrida de 5km com toda arrecadação destinada a instituições de caridade.',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 20, 8, 0),
      location: {
        address: 'Parque do Ibirapuera',
        city: 'São Paulo',
        state: 'SP',
        country: 'Brasil'
      },
      category: categories[3]._id, // Esportes
      organizer: admin._id,
      tags: ['esporte', 'corrida', 'beneficente', 'gratuito'],
      approvalStatus: 'approved',
      approvedBy: admin._id,
      approvalDate: new Date()
    });

    console.log('Relatos criados com sucesso');
    console.log('\nDados para login:');
    console.log('Admin: admin@exemplo.com / admin123');
    console.log('Usuário: usuario@exemplo.com / user123');

  } catch (error) {
    console.error(`Erro ao criar dados: ${error.message}`);
    process.exit(1);
  }
};

const runSeed = async () => {
  await connectDB();
  await clearData();
  await seedData();
  console.log('Seed concluído com sucesso!');
  process.exit(0);
};

runSeed(); 