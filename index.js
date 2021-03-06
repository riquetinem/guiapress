const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const connection = require("./database/database");

// Controllers
const categoriesController = require("./categories/CategoriesController");
const articlesController = require("./articles/ArticlesController");
const usersController = require("./user/UserController");

// Routers
const Article = require("./articles/Article");
const Category = require("./categories/Category");
const User = require("./user/User");

//View engine
app.set('view engine', 'ejs');

// Sessions
app.use(session({
    secret: "ancap",
    cookie: {
        path: "/"
    }
}));

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
app.use("/", usersController);

app.get("/", (req, res) => {
    Article.findAll({
        order: [
            ['id', 'DESC']
        ],
        limit: 4
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
        if (article != undefined) {
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

app.get("/category/:slug", (req, res) => {
    let slug = req.params.slug;
    Category.findOne({
        where: {
            slug: slug
        },
        // include == JOIN no sql padrao
        include: [{
            model: Article
        }]
    }).then(category => {
        if (category != undefined) {
            Category.findAll()
                .then(categories => {
                    res.render('index', {
                        articles: category.articles,
                        categories: categories
                    })
                })
        } else {
            res.redirect("/")
        }
    }).catch(err => {
        res.redirect("/")
    })
});


app.listen(8080, () => {
    console.log("O servidor foi iniciado");
})