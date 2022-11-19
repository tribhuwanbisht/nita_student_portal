const express = require('express');
const path = require('path');
const userRouter = require('./routes/userRouter');
const companyRouter = require('./routes/companyRouter');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.use(express.urlencoded());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

//For setting up pug template 
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


app.get('/', (req, res) => {
    res.status(200).render('index');
})

app.use('/api/v1/users', userRouter);
app.use('/api/v1/companies', companyRouter);
app.use('/a', viewRouter);



module.exports = app;