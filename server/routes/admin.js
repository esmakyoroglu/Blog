import express from 'express';
import post from './models/post.js';
import User from './models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const router=express.Router();
const adminLayout='../views/layouts/admin';
const jwtSecret=process.env.JWT_SECRET;

//kullanıcların kimlik bigilerini saklama, sayfalar içersinde gezinirken kimlik bilgilerini korumamızı sağlar
const authMiddleware=(req, res, next)=>{
    //kullanıcının oturum durumu cookies tarafından alınır, oturum açıkken tarayıcıda yerleştirilmiş olan jwt yi içerir
    const token=req.cookies.token;

    if(!token){
        return res.status(401).json({message:'yetkisiz'});
    }
    //kullanıcının oturumun açık olup olmadığını kontrol etme
    try {
        //jwtSecret doğrulama için kullanılmaktadır güvenlik açısından, .env içerisinde doğrulama kodunu vermiştik
        const decoded=jwt.verify(token, jwtSecret);
        req.userId=decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({message:'yetkisiz'});
    }
}

//admin yolu üzerinden kaynak alma
router.get('/admin', async(req, res)=>{
    try {
        
        const locals={
            title:"Admin",
            description:"NodeJS, Express ve MongoDB ile oluşturulmuş web sayfasıdır."
        }  
        // admin/index.ejs belgesine gönderir
        res.render('admin/index', {locals, layout:adminLayout});
    } catch (error) {
        console.log(error);
    }
});

//admin giriş işlemleri için kaynak gönderilir 
router.post('/admin', async(req, res)=>{
    try {
        const {username, password} = req.body;
        const user= await User.findOne({username});
        if(!user){
            return res.status(401).json({message:'Geçersiz kimlik bilgileri.'});
        }
        const isPasswordValid=await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(401).json({message:'Geçersiz kimlik bilgileri.'});
        }
        //kullanıcı adı ve şifre kontrol edilip JWT ile token oluşturulur jwt.sign sayesinde
        const token=jwt.sign({userId:user._id}, jwtSecret);
        res.cookie('token', token, {httpOnly:true});
        //dahsborard a yönlendirdik
        res.redirect('/dashboard');
 
    } catch (error) {
        console.log(error);
    }
});

// kullanıcı oturumunu korumak için authMiddleware eklemeyeliyiz
router.get('/dashboard', authMiddleware, async(req, res)=>{
    const locals={
        title:"Dashboard",
        description:"NodeJS, Express ve MongoDB ile oluşturulmuş web sayfasıdır."
    } 
    const data=await post.find();
    res.render('admin/dashboard', {
        locals,
        data
    });
});

router.get('/add_post', authMiddleware, async(req, res)=>{
    const locals={
        title:"Yazı Ekle",
        description:"NodeJS, Express ve MongoDB ile oluşturulmuş web sayfasıdır."
    } 
    const data=await post.find();
    res.render('admin/add_post', {
        locals,
        layout:adminLayout
    });
});

router.post('/add_post', authMiddleware, async(req, res)=>{

    try {
        const newPost= new post({
            title: req.body.title,
            body: req.body.body
        });
        await post.create(newPost);
        res.redirect('/dashboard');

    } catch (error) {
        console.log(error);
    }
    
});
router.get('/edit_post/:id', authMiddleware, async(req, res)=>{

    try {
        const locals={
            title:"Yazı Düzenle",
            description:"NodeJS, Express ve MongoDB ile oluşturulmuş web sayfasıdır."
        } 
        const data=await post.findOne({_id:req.params.id})
        res.render('admin/edit_post', {
            locals,
            data,
            layout: adminLayout
        });

    } catch (error) {
        console.log(error);
    }
    
});

// düzenleme işlemi için kaynakları güncelliyoruz
router.put('/edit_post/:id', authMiddleware, async(req, res)=>{

    try {
        await post.findByIdAndUpdate(req.params.id,{
            title:req.body.title,
            body:req.body.body,
            updateDate: Date.now()
        });
        res.redirect(`/edit_post/${req.params.id}`);

    } catch (error) {
        console.log(error);
    }
    
});

router.delete('/post_delete/:id', authMiddleware, async(req, res)=>{
    try {
        await post.deleteOne({_id:req.params.id});
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
});

router.get('/logout', (req, res)=>{
    //kullanıcı oturumunu sonlandırmak için
    res.clearCookie('token');
    res.redirect('/');
});

router.post('/register', async(req, res)=>{
    try {
        const {username, password} = req.body;
        //bcrypt.hash fonksiyonu gelen şifreyi güvenli bir şekilde hashler, amaç şifreleri veritabanında daha güvenli bir şekilde saklamak içindir
        const hashedPassword= await bcrypt.hash(password, 10);

        try {
            //hashlenmiş şifre ve kullanıcı adı kaydedilir
            const user=await User.create({username, password:hashedPassword});
            res.status(201).json({message:'Kullanıcı oluşturuldu.', user});
        } catch (error) {
            //zaten kullanıcı kayıtlı ise json yanıtını gönderir
            if(error.code===11000){
                res.status(409).json({message:'Kullanıcı sisteme kayıtlıdır.'});
            }
            res.status(500).json({message:'Sunucu hatası'});
        }

    } catch (error) {
        console.log(error);
    }
});

export default router;