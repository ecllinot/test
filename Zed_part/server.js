const express = require('express');
const mongoose = require('mongoose');
const Task = require('./models/task'); // 引入 models 文件夹中的 task.js 文件
const path = require('path');

const app = express();
app.use(express.json()); // 解析 JSON 请求体
app.use(express.static('public')); // 提供静态文件服务

// 连接到 MongoDB 数据库
mongoose.connect('mongodb+srv://2737835104:a8129819a@zed.i5dpz.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 获取所有任务的 API 路由 (Read)
app.get('/api/tasks', async (req, res) => {
    try {
      const tasks = await Task.find();
      // 自定义输出格式，使用 | 和空格分隔
      const formattedTasks = tasks.map(task => {
        return `ID: ${task._id} | Title: ${task.title} | Description: ${task.description} | Due Date: ${task.dueDate} | Priority: ${task.priority}`;
      }).join(' ; '); // 用 ; 分隔每个任务，保持在一行内
      res.send(formattedTasks);
    } catch (error) {
      res.status(500).send(error);
    }
  });

// 创建任务的 API 路由 (Create)
app.post('/api/tasks', async (req, res) => {
    const { id, title, description, dueDate, priority } = req.body;
  
    // 检查自定义 ID 是否已存在
    const existingTask = await Task.findById(id);
    if (existingTask) {
      return res.status(400).send({ message: '任务 ID 已存在，请使用其他 ID。' });
    }
  
    // 创建新任务
    const task = new Task({
      _id: id, // 使用用户提供的 ID
      title,
      description,
      dueDate,
      priority
    });
  
    try {
      await task.save();
      res.status(201).send(task);
    } catch (error) {
      res.status(500).send(error);
    }
  });

// 更新任务的 API 路由 (Update)
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, dueDate, priority } = req.body;

  try {
    const task = await Task.findByIdAndUpdate(id, { title, description, dueDate, priority }, { new: true, runValidators: true });
    if (!task) {
      return res.status(404).send('任务未找到');
    }
    res.send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

// 删除任务的 API 路由 (Delete)
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).send('任务未找到');
    }
    res.send('任务已删除');
  } catch (error) {
    res.status(500).send(error);
  }
});

// 提供前端页面的路由
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
  });
  
  // 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});