const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
require('./helpers/init_mongodb')

const app = express();

const PORT = process.env.PORT || 5500;


app.use(cors());
// Import Routes
const auth = require('./services/user/Auth.route');
const project = require('./services/project/Project.route');
const projectCategory = require('./services/project/ProjectCategory.route');

// Middleware
app.use(express.json());

// Route Middlewares
app.use('/users', auth);
app.use('/project', project);
app.use('/projectCategory', projectCategory);


app.listen(PORT, () => console.log('Server up and running on PORT ' + PORT));
