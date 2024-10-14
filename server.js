const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/todoApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String
});

const taskSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    task: String
});

const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            res.json({ success: false, message: 'Username already exists' });
        } else {
            const user = new User({ username, password });
            await user.save();
            res.json({ success: true });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (user) {
            res.json({ success: true, userId: user._id });
        } else {
            res.json({ success: false, message: 'Invalid username or password' });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

app.post('/users/:userId/tasks', async (req, res) => {
    const { task } = req.body;
    const { userId } = req.params;
    try {
        const newTask = new Task({ userId, task });
        await newTask.save();
        res.json(newTask);
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

app.get('/users/:userId/tasks', async (req, res) => {
    const { userId } = req.params;
    try {
        const tasks = await Task.find({ userId });
        res.json(tasks);
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

app.put('/users/:userId/tasks/:taskId', async (req, res) => {
    const { taskId } = req.params;
    const { task } = req.body;
    try {
        const updatedTask = await Task.findByIdAndUpdate(taskId, { task }, { new: true });
        res.json(updatedTask);
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

app.delete('/users/:userId/tasks/:taskId', async (req, res) => {
    const { taskId } = req.params;
    try {
        await Task.findByIdAndDelete(taskId);
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});