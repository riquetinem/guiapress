const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/database");

// Routers
const categoriesController = require("./categories/CategoriesController");
const articlesController = require("./articles/ArticlesController");

const Article = require("./articles/Article");
const Category = require("./categories/Category");

//View engine
app.set('view engine', 'ejs');

//statice
app.use(express.static('public'));

//Body parser
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

//Database
connection
    .authenticate()
    .then(() => {
        console.log("Conexao feita com sucesso")
    }).catch((error) => {
        console.log(error)
});

// import routers for app
app.use("/", categoriesController);
app.use("/", articlesController);

app.get("/", (req, res) => {
    Article.findAll({
        order: [
            ['id', 'DESC']
        ]
    })
        .then(articles => {
            Category.findAll()
                .then(categories => {
                    res.render('index', {
                        articles: articles,
                        categories: categories
                    })
                })
        })
});

app.get('/:slug', (req, res) => {
    let slug = req.params.slug;
    Article.findOne({
        where: {
            slug: slug
        }
    }).then(article => {
        if(article != undefined){
           Category.findAll()
               .then(categories => {
                   res.render('article', {
                       article: article,
                       categories: categories
                   })
               })
        } else {
            res.redirect("/");
        }
    }).catch(err => {
        res.redirect("/")
    })
});

app.listen(8080, () => {
    console.log("O servidor foi iniciado");
})