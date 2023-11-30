import 'dotenv/config';
import express from 'express';
import expressEjsLayouts from 'express-ejs-layouts';
import mainRoute from './server/routes/main.js';
import admin from './server/routes/admin.js'
//database i ekleme 
import connectDB from './server/routes/config/db.js';
import cookieParser from 'cookie-parser';
import MongoStore from 'connect-mongo';
import session from 'express-session';
//PUT ve DELETE metodları için methodoverride kullanmalıyız
import methodOverride from 'method-override';


const app=express();
const port=3000 || process.env.PORT;
//public dosyamızı rahatlıkla kullanabilmek için
app.use(express.static('public'));
//sayfa düzeni için
app.use(expressEjsLayouts);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

//MongoDB database bağlantısı
connectDB();
// veri almamız gerektiği için kutucukların içerisinden
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

//oturum yönetimi böylelikle tüm oturumlar mongoDB de saklanmış olur
app.use(session({
    secret: 'blog',
    resave: false,
    saveUninitialized:true,
    store: MongoStore.create({
        //.env içerisindeki mongodb
        mongoUrl:process.env.MONGODB_URI
    }),
}));
//buraya yönlendirme yapmış olduk
app.use('/', mainRoute);
//admin sayfası yönlendirmesi
app.use('/', admin);

app.listen(port, ()=>{
    console.log(`${port}'da çalışmaktadır`);
})