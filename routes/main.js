const express = require('express');
const router = express.Router();
const User = require('../models/User');


router.get('/', (req, res) => {
    console.log(req.session);
    res.render("account/home", { title: 'Anasayfa' });
})

router.get('/register', (req, res) => {
    if (!req.session.userId) {
        res.render("account/register", { title: 'Hesap Oluştur' });

    }
    else {
        res.redirect("/userlist")
    }
})

router.post('/register', (req, res) => {

    const email = req.body.email;

    User.findOne({ email: email }).then(user => {
        if (user) {
            req.session.sessionMessage = {
                type: "alert alert-danger text-center",
                message: "Bu email hesabı alınmış!"
            }

            res.redirect('/register');

        } else {
            User.create(req.body, (error, user) => {
                req.session.sessionMessage = {
                    type: "alert alert-success text-center",
                    message: "Kayıt işlemi başarıyla tamamlandı!"
                }

                res.redirect("/login")

            })
        }
    })

})



router.get('/login', (req, res) => {
    if (!req.session.userId) {
        res.render("account/login", { title: 'Giriş Yap' });

    }
    else {
        res.redirect("/userlist");
    }
})

router.post('/login', (req, res) => {

    const { email, password } = req.body

    User.findOne({ email }, (error, user) => {

        if (user) {

            if (user.password === password) {

                req.session.userId = user._id
                req.session.email = user.email
                res.redirect("/userlist")

            }
            else {

                req.session.sessionMessage = {
                    type: "alert alert-danger text-center",
                    message: "Geçersiz parola lütfen kontrol et!"
                }
                res.redirect("/login")
            }

        }
        else {

            req.session.sessionMessage = {
                type: "alert alert-danger text-center",
                message: "Geçersiz e-posta lütfen kontrol et!"
            }
            res.redirect("/login")
        }

    })

})

router.get('/logout', (req, res) => {

    req.session.destroy(() => {
        res.redirect("/login")
    })

})



router.get('/userlist', (req, res) => {
    if (!req.session.userId) {

        res.redirect("/login")

    }
    else {

        User.find({}).then((users) => {
            if (req.session.userId) {
                res.render("account/userlist", {
                    users: users,
                    title: 'Kullanıcılar'
                })
            } else {
                res.redirect("/logout")
            }

        })
    }

})

router.delete('/userlist/:id', (req, res) => {

    if (req.params.id == req.session.userId) {
        User.deleteOne({ _id: req.params.id }).then(() => {
            req.session.userId = ""
            req.session.sessionMessage = {
                type: "alert alert-danger text-center",
                message: "Silme işlemi başarılı ve çıkış yapıldı!"
            }
            res.redirect("/login")
        })
    } else {
        req.session.sessionMessage = {
            type: "alert alert-danger text-center",
            message: "Başka bir kullanıcıyı silemezsiniz!"
        }
        res.redirect("/userlist")
    }

})

router.get('/userlist/edit/:id', (req, res) => {

    if (!req.session.userId) {
        res.redirect("/login")
    }
    else {

        User.findOne({ _id: req.params.id }).then((user) => {
            if (req.params.id == req.session.userId) {
                res.render("account/useredit", {
                    user: user,
                    title: 'Kullanıcı Düzenle'
                })
            }
            else {
                req.session.sessionMessage = {
                    type: "alert alert-danger text-center",
                    message: "Başka bir kullanıcının bilgilerini düzenleyemezsiniz!"
                }
                res.redirect("/userlist")
            }


        })
    }
})

router.put('/userlist/:id', (req, res) => {


    User.findOne({ email: req.body.email }).then((user) => {
        if (user) {

            if (user.email == req.session.email) {

                User.findOne({ _id: req.params.id }).then((user) => {
                    user.name = req.body.name
                    user.surname = req.body.surname
                    user.email = req.body.email
                    user.age = req.body.age
                    user.password = req.body.password
                    req.session.email = req.body.email

                    user.save().then((user) => {
                        req.session.sessionMessage = {
                            type: "alert alert-success text-center",
                            message: "Kaydedildi"
                        }
                        res.redirect("/userlist")
                    })
                })

            }
            else {
                req.session.sessionMessage = {
                    type: "alert alert-warning text-center",
                    message: "Böyle bir e-posta var"
                }
                res.redirect(`/userlist/edit/${req.params.id}`)
            }
        }
        else {
            User.findOne({ _id: req.params.id }).then((user) => {
                user.name = req.body.name
                user.surname = req.body.surname
                user.email = req.body.email
                user.age = req.body.age
                user.password = req.body.password
                req.session.email = req.body.email

                user.save().then((user) => {
                    req.session.sessionMessage = {
                        type: "alert alert-success text-center",
                        message: "Kaydedildi"
                    }
                    res.redirect("/userlist")
                })
            })
        }
    })

})




module.exports = router