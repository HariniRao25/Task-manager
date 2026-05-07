const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const usersRoutes = require('./routes/users');
const statsRoutes = require('./routes/stats');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan ? morgan('dev') : (req,res,next)=>next());

app.get('/', (req, res) => {
  res.json({
    message: 'Task Manager API is running',
    status: 'ok',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/stats', statsRoutes);

app.use(errorHandler);

module.exports = app;
