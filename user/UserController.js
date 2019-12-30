const express = require("express");
const router = express.Router();
const User = require("./User");
const bcrypt = require("bcryptjs");


//nodemailer = enviar email
const nodemailer = require("nodemailer");

//precisa ver como configura o envio de email pois esta dando erro
let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "testsendemailaaaaa@gmail.com",
        pass: "senhateste123"
    },
    tls: {
        rejectUnauthorized: false
    }
});

// função para definir o corpo do email e o to é para onde vai ser enviado o email
function sendEmailFromNodemailer(email, subject, text, html) {
    transporter.sendMail({
        from: "Guiapress <testsendemailaaaaa@gmail.com>",
        to: email,
        subject: subject,
        text: text,
        html: html
    }).then(message => {
        console.log(message)
    }).catch(err => {
        console.log(err)
    });
}

router.get("/admin/users", (req, res) => {
    User.findAll()
        .then(users => {
            res.render("admin/users/index", {
                users: users
            })
        })
});

router.get("/admin/users/create", (req, res) => {
    res.render("admin/users/create");
});

router.post("/users/create", (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findOne({
        where: {
            email: email
        }
    }).then(user => {
        if (user == undefined) {
            let salt = bcrypt.genSaltSync(10);
            let hash = bcrypt.hashSync(password, salt);

            User.create({
                email: email,
                password: hash
            }).then(() => {
                let subject = "Seja bem vindo";
                let text = "welcome";
                let html = `
                <h1>Seja bem vindo ao guiapress</h1> 
                
                <h2>Para acessar a area administrativa do guia press <a href="http://localhost:8080/login">Clique aqui</a> 
                <br>
                E utilize seu email e senha
                </h2>
                <p><b>Divita-se criando varios artigos</b></p>
                <br><br><br><br>

                <p>Att,</p>
                <p>Equipe Guiapress</p>`;
                sendEmailFromNodemailer(email, subject, text, html);
                res.redirect("/")
            }).catch(err => {
                res.redirect("/")
            })
        } else {
            res.redirect("/admin/users/create")
        }
    })
});

router.get("/login", (req, res) => {
    res.render("admin/users/login");
});

router.post("/authenticate", (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findOne({
        where: {
            email: email
        }
    }).then(user => {
        if (user != undefined) {
            let corret = bcrypt.compareSync(password, user.password);

            if (corret) {
                req.session.user = {
                    id: user.id,
                    email: user.email
                }

                res.redirect("/admin/articles")
            } else {
                res.redirect("/login")
            }
        } else {
            res.redirect("/login")
        }
    })
})

router.get("/logout", (req, res) => {
    req.session.user = undefined;

    res.redirect("/login")
});

router.post("/users/reset", (req, res) => {
    let email = req.body.email;
    let defaultPass = "asd";

    User.findOne({
        where: {
            email: email
        }
    }).then(user => {
        if (user != undefined) {
            let salt = bcrypt.genSaltSync(10);
            let hash = bcrypt.hashSync(defaultPass, salt);

            User.update({password: hash}, {
                where: {
                    id: user.id
                }
            }).then(() =>{
                let subject = "Reset de senha: guiapress";
                let text = "Reset de senha: guiapress";
                let html = `<h1> Sua senha foi resetada</h1> 
                
                <h2>Sua nova senha é: <span style="color: #0080ff">${defaultPass}</span> </h2>
                <p><b>Lembre-se de troca-la</b></p>
                <br><br><br><br>

                <p>Att,</p>
                <p>Equipe Guiapress</p>`;
                sendEmailFromNodemailer(email, subject, text, html);
                res.redirect("/admin/users")
            }).catch(err => {
                res.redirect("/admin/users")
            })
        } else {
            res.redirect("/admin/users")
        }
    }).catch(err => {
        res.redirect("/admin/users")
    })

});

router.post("/admin/delete", (req, res) => {
    let id = req.body.id;

    if (id != undefined) {
        User.destroy({
            where: {
                id: id
            }
        }).then(() => {
            res.redirect("/admin/users")
        }).catch(err => {
            res.redirect("/admin/users")
        })
    } else {
        res.redirect("/admin/users")
    }
});

module.exports = router;