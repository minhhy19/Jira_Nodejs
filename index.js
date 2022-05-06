const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const expressPinoLogger = require('express-pino-logger');

dotenv.config();
require('./helpers/init_mongodb');

const app = express();
const logger = require('./loggerService');

const loggerMidlleware = expressPinoLogger({
	logger,
	autoLogging: true
});
app.use(loggerMidlleware);

const PORT = process.env.PORT || 5500;

app.use(cors());

// Import Routes
const auth = require('./services/user/Auth.route');
const project = require('./services/project/Project.route');
const projectCategory = require('./services/project/ProjectCategory.route');

const status = require('./services/status/Status.route');
const priority = require('./services/priority/Priority.route');
const taskType = require('./services/taskType/TaskType.route');
const comment = require('./services/comment/Comment.route');

const ping = require('./services/ping/Ping.route');

// Middleware
app.use(express.json());

// Route Middlewares
app.use('/users', auth);
app.use('/project', project);
app.use('/projectCategory', projectCategory);
app.use('/comment', comment);

app.use('/priority', priority);
app.use('/status', status);
app.use('/taskType', taskType);

app.use('/ping', ping);

app.listen(PORT, () => console.log(`Server up and running on PORT ${PORT}`));
