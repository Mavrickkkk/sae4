const express = require('express');
const connection = require("../database");
const router = express.Router();
const bcrypt = require('bcrypt');

router.get('/register', (req, res) => {
    res.render('register', { title: 'Se connecter' });
});

router.post('/submitUser', async (req, res) => {
    const { username, name, password } = req.body;

    try {
        // Hasher le mot de passe avec bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Utiliser une promesse pour la requête SQL
        const insertUser = () => {
            return new Promise((resolve, reject) => {
                const sql = 'INSERT INTO utilisateur (username, name, password) VALUES (?, ?, ?)';
                connection.query(sql, [username, name, hashedPassword], (err, result) => {
                    if (err) {
                        console.error('Erreur lors de l\'insertion de l\'utilisateur :', err);
                        reject(err);
                        return;
                    }
                    console.log('Utilisateur inséré avec succès:', { username, name });
                    resolve(result);
                });
            });
        };

        // Attendre que la promesse soit résolue avant de rediriger
        await insertUser();

        req.session.username = username;
        res.redirect('/');
    } catch (error) {
        console.error('Erreur lors de l\'hachage du mot de passe ou de l\'insertion de l\'utilisateur :', error);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;
