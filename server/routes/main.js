import express from 'express';
import Post from './models/post.js';
//yönlendirme yapmış olduğumuz için app.js den
const router=express.Router(); 

//serach.ejs kaynak gönderme
router.post('/search', async(req, res)=>{
    try { 
        const locals={
            title:"Search",
            description:"NodeJS, Express ve MongoDB ile oluşturulmuş web sayfasıdır."
        }  
        //searchTerm name den geliyor bizim verdiğimiz name header.ejs den
        let searchTerm=req.body.searchTerm;
        const searchSpecialChar=searchTerm.replace(/[^a-zA-Z0-9 ]/g, "")
        //PostSchema dan bulmaya çalışır
        const data = await Post.find({
            $or:[
                //girilen kelimelere göre filtreler
                {title: {$regex: new RegExp(searchSpecialChar, 'i')}},
                {body: {$regex: new RegExp(searchSpecialChar, 'i')}}
            ]
        });
        //search.ejs sayfasına bulunan öğeleri göndermiş oluruz
        res.render('search', {
            data, 
            locals,
        });
    } catch (error) {
        console.log(error);
    }
});
 
//ana sayfadan bilgileri alacak, async yi bu yüzden yazarız senkronize olsun diye
router.get('', async(req, res)=>{

 //yazı bilgilerini bulmaya çalışacak
    try {
        const locals={
            title:"Blog & Günlük",
            description:"NodeJS, Express ve MongoDB ile oluşturulmuş web sayfasıdır."
        }
        //sayfa başına gösterilecek veri sayısı
        let perPage=10;
        //sayfa değerini alma 
        let page=req.query.page || 1;
        //verilerin sıralanması, en son yüklenen yukarıda görüntülenir
        const data= await Post.aggregate([{$sort:{createdAt:-1}}])
        //atlanılacak sayfa sayısı
        .skip(perPage * page - perPage)
        //her sayfada gösterilecek belge sayısını sınırlar
        .limit(perPage)
        //sonuçları getirme
        .exec(); 
        //toplam veri sayısı
        const count = await Post.countDocuments({});
        const nextPage=parseInt(page)+1;
        //bir sonraki  sayfa var mı kontrol edilir. boolean değer döndürür
        const hasNextPage= nextPage <= Math.ceil(count/perPage);
        //index.ejs sayfasına değerleri gönderir
        res.render('index', {
            locals, 
            data,
            current:page,
            nextPage:hasNextPage ? nextPage : null,
        });

    } catch (error) {
        console.log(error);
    }
});
// yazıların id sini istiyoruz
router.get('/post/:id', async(req, res)=>{
    try {
        
        //verilerin idlerini almaya çalışıyoruz. mongoDB post idleri : _id olarak yazmış o yüzden _id aldık
        let slug= req.params.id;
        const data= await Post.findById({ _id:slug });
        
        const locals={
            title: data.title,
            description:"NodeJS, Express ve MongoDB ile oluşturulmuş web sayfasıdır."
        }
        
        res.render('post', {
            locals, 
            data,
        }); 

    } catch (error) {
        console.log(error);
    }
});


router.get('/contact', (req, res)=>{
    res.render('contact');
});



//routerlerın diğer sayfalarda çalışabilmesi için eklemeliyiz
export default router;