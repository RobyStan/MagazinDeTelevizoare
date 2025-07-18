// Importarea modulelor necesare și configurarea inițială
const express = require("express");
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const sass = require('sass');
const ejs = require('ejs');
const AccesBD = require("./module_proprii/accesbd.js");

const formidable = require("formidable");
const { Utilizator } = require("./module_proprii/utilizator.js");
const session = require('express-session');
const Drepturi = require("./module_proprii/drepturi.js");
const Client = require('pg').Client;

// Configurarea clientului PostgreSQL
var client = new Client({
    database: "cti_2024",
    user: "roby",
    password: "roby",
    host: "localhost",
    port: 5432
});
client.connect();   

// Execută o interogare simplă pentru a obține toate televizoarele
client.query("SELECT * FROM televizoare", function(err, rez){
    console.log(rez);
})

// Obiect global pentru stocarea erorilor, imaginilor și a altor foldere
obGlobal = {
    obErori: null,
    obImagini: null,
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "backup"),
}

// Obținerea categoriilor din baza de date
client.query("select * from unnest(enum_range(null::produse))", function(err, rezCategorie){
    if (err) {
        console.log(err);
    }
    else {
        obGlobal.optiuniMeniu = rezCategorie.rows;
    }
});

// Crearea unor foldere dacă nu există deja
vect_foldere = ["temp", "temp1", "backup", "poze_uploadate"]
for (let folder of vect_foldere) {
    let caleFolder = path.join(__dirname, folder)
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder);
    }
}

// Configurarea aplicației Express
app = express();
console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());

// Configurarea sesiunilor pentru aplicația Express
app.use(session({
    secret: 'abcdefg', // folosit pentru criptarea id-ului de sesiune
    resave: true,
    saveUninitialized: false
}));

// Middleware pentru setarea unor variabile locale și utilizator
app.use("/*", function(req, res, next){
    res.locals.optiuniMeniu = obGlobal.optiuniMeniu;
    res.locals.Drepturi = Drepturi;
    if (req.session.utilizator) {
        req.utilizator = res.locals.utilizator = new Utilizator(req.session.utilizator);
    }    
    next();
})  

// Setarea motorului de template-uri ca EJS
app.set("view engine", "ejs");

// Servirea fișierelor statice
app.use("/resurse", express.static(__dirname + "/resurse"));
app.use("/poze_uploadate", express.static(__dirname + "poze_uploadate"));
app.use("/node_modules", express.static(__dirname + "/node_modules"));

// Rute pentru paginile principale
app.get(["/", "/index", "/home"], function(req, res){
    res.render("pagini/index", { ip: req.ip, imagini: obGlobal.obImagini.imagini });
})

// Trimiterea unui mesaj fix
app.get("/cerere", function(req, res){
    res.send("<b>Hello</b> <span style='color:red'>world!</span>");
})

// Trimiterea unui mesaj dinamic
app.get("/data", function(req, res, next){
    res.write("Data: ");
    next();
});
app.get("/data", function(req, res){
    res.write("" + new Date());
    res.end();
});

// Generarea unei oferte noi
function generateOffer() {
    client.query("SELECT DISTINCT categorie FROM televizoare", (err, res) => {
        if (err) {
            console.error(err);
            return;
        }
        
        const categories = res.rows.map(row => row.categorie);
        const reductions = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
        
        fs.readFile(path.join(__dirname, 'resurse/json/oferte.json'), 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }

            let offers = JSON.parse(data).oferte;
            const lastOffer = offers[0];
            let newCategory;

            do {
                newCategory = categories[Math.floor(Math.random() * categories.length)];
            } while (lastOffer && lastOffer.categorie === newCategory);

            const newReduction = reductions[Math.floor(Math.random() * reductions.length)];
            const now = new Date();
            const end = new Date(now.getTime() + 1 * 60 * 60 * 1000); // Interval de 1 oră pentru prezentare

            const newOffer = {
                categorie: newCategory,
                "data-incepere": now.toISOString(),
                "data-finalizare": end.toISOString(),
                reducere: newReduction
            };

            offers.unshift(newOffer);

            fs.writeFile(path.join(__dirname, 'resurse/json/oferte.json'), JSON.stringify({ oferte: offers }, null, 4), (err) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log("New offer generated:", newOffer);
                }
            });
        });
    });
}

setInterval(generateOffer, 1 * 60 * 60 * 1000); // Interval de 1 ora

function cleanupOldOffers() {
    fs.readFile(path.join(__dirname, 'resurse/json/oferte.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

        const offers = JSON.parse(data).oferte;
        const now = new Date();
        const T2 = 24 * 60 * 60 * 1000; // 24 ore pentru ștergerea ofertelor vechi

        const filteredOffers = offers.filter(offer => {
            const endTime = new Date(offer['data-finalizare']).getTime();
            return (now.getTime() - endTime) < T2;
        });

        fs.writeFile(path.join(__dirname, 'resurse/json/oferte.json'), JSON.stringify({ oferte: filteredOffers }, null, 4), (err) => {
            if (err) {
                console.error(err);
            } else {
                console.log("Old offers cleaned up");
            }
        });
    });
}

setInterval(cleanupOldOffers, 24 * 60 * 60 * 1000); // Rulează la fiecare 24 de ore

// Rută pentru compararea produselor
app.get('/comparare', (req, res) => {
    let data = [];
    try {
        data = JSON.parse(req.query.data);
    } catch (e) {
        console.error('Invalid JSON data', e);
    }
    res.render('pagini/comparare', { data }); // Specifică calea corectă către EJS
});

// Trimiterea unui mesaj dinamic în funcție de parametri (req.params; req.query)
app.get("/suma/:a/:b", function(req, res){
    var suma = parseInt(req.params.a) + parseInt(req.params.b)
    res.send("" + suma);
}); 

// Servirea favicon-ului
app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname, "resurse/imagini/ico/favicon.ico"));
});

// Rute pentru gestionarea produselor
app.get("/produse", function(req, res){
    console.log(req.query)
    var conditieQuery = "";
    if (req.query.tip) {
        conditieQuery = ` where tip_produs='${req.query.tip}'`
    }
    client.query("select * from unnest(enum_range(null::branduri))", function(err, rezOptiuni){

        client.query(`select * from televizoare ${conditieQuery}`, function(err, rez){
            if (err){
                console.log(err);
                afisareEroare(res, 2);
            }
            else {
                res.render("pagini/produse", { produse: rez.rows, optiuni: rezOptiuni.rows })
            }
        })
    });
})

app.get("/seturi", function(req, res) {
    client.query(`SELECT s.id, s.nume_set, s.descriere_set, 
                        json_agg(json_build_object('id', t.id, 'nume', t.nume, 'pret', t.pret)) as produse, 
                        SUM(t.pret) as pret_initial, 
                        COUNT(t.id) as numar_produse
                 FROM seturi s
                 JOIN asociere_set a ON s.id = a.id_set
                 JOIN televizoare t ON a.id_produs = t.id
                 GROUP BY s.id`, function(err, rez){
        if (err){
            console.log(err);
            afisareEroare(res, 2);
        } else {
            let seturi = rez.rows.map(set => {
                let reducere = Math.min(5, set.numar_produse) * 5;
                set.pret_final = set.pret_initial * (1 - reducere / 100);
                return set;
            });
            res.render("pagini/seturi", { seturi: seturi });
        }
    });
});

app.get("/produs/:id", function(req, res) {
    client.query(`SELECT * FROM televizoare WHERE id=${req.params.id}`, function(err, rez) {
        if (err) {
            console.log(err);
            afisareEroare(res, 2);
        } else {
            let produs = rez.rows[0];
            client.query(`SELECT s.id, s.nume_set, s.descriere_set, 
                                 json_agg(json_build_object('id', t.id, 'nume', t.nume)) as produse, 
                                 SUM(t.pret) as pret_initial, 
                                 COUNT(t.id) as numar_produse
                          FROM seturi s
                          JOIN asociere_set a ON s.id = a.id_set
                          JOIN televizoare t ON a.id_produs = t.id
                          WHERE s.id IN (SELECT id_set FROM asociere_set WHERE id_produs=${req.params.id})
                          GROUP BY s.id`, function(err, rezSeturi) {
                if (err) {
                    console.log(err);
                    afisareEroare(res, 2);
                } else {
                    let seturi = rezSeturi.rows.map(set => {
                        let reducere = Math.min(5, set.numar_produse) * 5;
                        set.pret_final = set.pret_initial * (1 - reducere / 100);
                        return set;
                    });
                    client.query(`SELECT * FROM televizoare WHERE categorie='${produs.categorie}' AND id != ${produs.id} LIMIT 4`, function(err, rezProduseSimilare) {
                        if (err) {
                            console.log(err);
                            afisareEroare(res, 2);
                        } else {
                            res.render("pagini/produs", {
                                prod: produs,
                                produseSimilare: rezProduseSimilare.rows,
                                seturi: seturi
                            });
                        }
                    });
                }
            });
        }
    });
});

// Rute pentru gestionarea utilizatorilor
app.post("/inregistrare", function(req, res){
    var username;
    var poza;
    var formular = new formidable.IncomingForm();
    formular.parse(req, function(err, campuriText, campuriFisier){
        console.log("Inregistrare:", campuriText);
        console.log(campuriFisier);
        console.log(poza, username);
        var eroare = "";

        // Crearea unui nou utilizator
        var utilizNou = new Utilizator();
        try {
            utilizNou.setareNume = campuriText.nume[0];
            utilizNou.setareUsername = campuriText.username[0];
            utilizNou.email = campuriText.email[0];
            utilizNou.prenume = campuriText.prenume[0];
            utilizNou.parola = campuriText.parola[0];
            utilizNou.culoare_chat = campuriText.culoare_chat[0];
            utilizNou.poza = poza;
            Utilizator.getUtilizDupaUsername(campuriText.username[0], {}, function(u, parametru, eroareUser){
                if (eroareUser == -1) {
                    // Salvează utilizatorul dacă username-ul nu există
                    utilizNou.salvareUtilizator();
                } else {
                    eroare += "Mai exista username-ul";
                }

                if (!eroare) {
                    res.render("pagini/inregistrare", { raspuns: "Inregistrare cu succes!" })
                } else {
                    res.render("pagini/inregistrare", { err: "Eroare: " + eroare });
                }
            })
        } catch(e) {
            console.log(e);
            eroare += "Eroare site; reveniti mai tarziu";
            console.log(eroare);
            res.render("pagini/inregistrare", { err: "Eroare: " + eroare })
        }
    });

    formular.on("field", function(nume, val) { 
        if (nume == "username")
            username = val;
    });

    formular.on("fileBegin", function(nume, fisier) {
        var folderUser = path.join(__dirname, "poze_uploadate", username);
        if (!fs.existsSync(folderUser)) {
            fs.mkdirSync(folderUser);
        }   
        fisier.filepath = path.join(folderUser, fisier.originalFilename);
        poza = fisier.originalFilename;
    });

    formular.on("file", function(nume, fisier) {
        console.log("file");
    });
});

// Login pentru utilizatori
app.post("/login", function(req, res){
    var username;
    var formular = new formidable.IncomingForm();
    formular.parse(req, function(err, campuriText, campuriFisier){
        var parametriCallback = {
            req: req,
            res: res,
            parola: campuriText.parola[0]
        }
        Utilizator.getUtilizDupaUsername(campuriText.username[0], parametriCallback, function(u, obparam, eroare){
            let parolaCriptata = Utilizator.criptareParola(obparam.parola);
            if (u.parola == parolaCriptata && u.confirmat_mail) {
                u.poza = u.poza ? path.join("poze_uploadate", u.username, u.poza) : "";
                obparam.req.session.utilizator = u;               
                obparam.req.session.mesajLogin = "Bravo! Te-ai logat!";
                obparam.res.redirect("/index");
            } else {
                obparam.req.session.mesajLogin = "Date logare incorecte sau nu a fost confirmat mailul!";
                obparam.res.redirect("/index");
            }
        })
    });
});

// Logout pentru utilizatori
app.get("/", function(req, res){
    req.session.destroy();
    res.locals.utilizator = null;
    res.render("pagini/logout");
});

// Confirmarea email-ului pentru utilizatori
app.get("/cod/:username/:token", function(req, res){
    try {
        var parametriCallback = {
            req: req,
            token: req.params.token
        }
        Utilizator.getUtilizDupaUsername(req.params.username, parametriCallback, function(u, obparam){
            let parametriCerere = {
                tabel: "utilizatori",
                campuri: { confirmat_mail: true },
                conditiiAnd: [`id=${u.id}`]
            };
            AccesBD.getInstanta().update(parametriCerere, function(err, rezUpdate){
                if (err || rezUpdate.rowCount == 0) {
                    afisareEroare(res, 3);
                } else {
                    res.render("pagini/confirmare.ejs");
                }
            })
        })
    } catch (e) {
        afisareEroare(res, 2);
    }
})

// Actualizarea profilului utilizatorului
app.post("/profil", function(req, res){
    if (!req.session.utilizator) {
        afisareEroare(res, 403)
        return;
    }
    var formular = new formidable.IncomingForm();
    formular.parse(req, function(err, campuriText, campuriFile){
        var parolaCriptata = Utilizator.criptareParola(campuriText.parola[0]);
        AccesBD.getInstanta().updateParametrizat({
            tabel: "utilizatori",
            campuri: ["nume", "prenume", "email", "culoare_chat"],
            valori: [
                `${campuriText.nume[0]}`,
                `${campuriText.prenume[0]}`,
                `${campuriText.email[0]}`,
                `${campuriText.culoare_chat[0]}`
            ],
            conditiiAnd: [
                `parola='${parolaCriptata}'`,
                `username='${campuriText.username[0]}'`
            ]
        }, function(err, rez){
            if (err) {
                afisareEroare(res, 2);
                return;
            }
            if (rez.rowCount == 0) {
                res.render("pagini/profil", { mesaj: "Update-ul nu s-a realizat. Verificati parola introdusa." });
                return;
            } else {            
                req.session.utilizator.nume = campuriText.nume[0];
                req.session.utilizator.prenume = campuriText.prenume[0];
                req.session.utilizator.email = campuriText.email[0];
                req.session.utilizator.culoare_chat = campuriText.culoare_chat[0];
                res.locals.utilizator = req.session.utilizator;
            }
            res.render("pagini/profil", { mesaj: "Update-ul s-a realizat cu succes." });
        });
    });
});

// Rute pentru afișarea erorilor
app.get("/*.ejs", function(req, res){
    afisareEroare(res, 400);
});

app.get(new RegExp("^\/[A-Za-z\/0-9]*\/$"), function(req, res){
    afisareEroare(res, 403);
});

//^ - Marchează începutul șirului
// $ - Marchează sfârșitul șirului
// [A-Za-z\/0-9]* - Caracterele permise în URL
// \/ - Caracterul /
// 0-9 - Cifrele de la 0 la 9
// * - 0 sau mai multe apariții ale caracterelor precedente
// Cauta url-uri care incep cu /, contin litere mari sau mici, cifre si / si se termina cu /

app.get("/*", function(req, res){
    try {
        res.render("pagini" + req.url, function(err, rezHtml){
            if (err) {
                if (err.message.startsWith("Failed to lookup view")) {
                    afisareEroare(res, 404);
                    console.log("Nu a gasit pagina: ", req.url)
                }
            } else {
                res.send(rezHtml + "");
            }
        });         
    } catch (err1) {
        if (err1.message.startsWith("Cannot find module")) {
            afisareEroare(res, 404);
            console.log("Nu a gasit resursa: ", req.url)
        } else {
            afisareEroare(res);
            console.log("Eroare:", err1)
        }
    }
})      

// Inițializarea erorilor
function initErori(){
    var continut = fs.readFileSync(path.join(__dirname, "resurse/json/erori.json")).toString("utf-8");
    obGlobal.obErori = JSON.parse(continut);
    for (let eroare of obGlobal.obErori.info_erori) {
        eroare.imagine = path.join(obGlobal.obErori.cale_baza, eroare.imagine)
    }
    obGlobal.obErori.eroare_default = path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine)
} 
initErori()

// Afișarea erorilor
function afisareEroare(res, _identificator, _titlu, _text, _imagine){
    let eroare = obGlobal.obErori.info_erori.find(function(elem){
        return elem.identificator == _identificator
    })
    if (!eroare) {
        let eroare_default = obGlobal.obErori.eroare_default;
        res.render("pagini/eroare", {
            titlu: _titlu || eroare_default.titlu,
            text: _text || eroare_default.text,
            imagine: _imagine || eroare_default.imagine,
        })
        return;
    } else {
        if (eroare.status)
            res.status(eroare.identificator)
        res.render("pagini/eroare", {
            titlu: _titlu || eroare.titlu,
            text: _text || eroare.text,
            imagine: _imagine || eroare.imagine,
        })
        return;
    }
}

// Inițializarea imaginilor
function initImagini(){
    var continut = fs.readFileSync(path.join(__dirname, "resurse/json/galerie.json")).toString("utf-8");
    obGlobal.obImagini = JSON.parse(continut);
    let vImagini = obGlobal.obImagini.imagini;

    let caleAbs = path.join(__dirname, obGlobal.obImagini.cale_galerie);
    let caleAbsMediu = path.join(__dirname, obGlobal.obImagini.cale_galerie, "mediu");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);

    for (let imag of vImagini) {
        [numeFis, ext] = imag.fisier.split(".");
        let caleFisAbs = path.join(caleAbs, imag.fisier);
        let caleFisMediuAbs = path.join(caleAbsMediu, numeFis + ".webp");
        sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);
        imag.fisier_mediu = path.join("/", obGlobal.obImagini.cale_galerie, "mediu", numeFis + ".webp")
        imag.fisier = path.join("/", obGlobal.obImagini.cale_galerie, imag.fisier)
    }
}
initImagini();

// Compilarea fișierelor SCSS
function compileazaScss(caleScss, caleCss){
    if(!caleCss){
        let numeFisExt = path.basename(caleScss);
        let numeFis = numeFisExt.split(".")[0]
        caleCss = numeFis + ".css";
    }
    
    if (!path.isAbsolute(caleScss))
        caleScss = path.join(obGlobal.folderScss, caleScss)
    if (!path.isAbsolute(caleCss))
        caleCss = path.join(obGlobal.folderCss, caleCss)
    
    let caleBackup = path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup, { recursive: true })
    }
    
    let numeFisCss = path.basename(caleCss);
    if (fs.existsSync(caleCss)) {
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css", numeFisCss))
    }
    rez = sass.compile(caleScss, {"sourceMap": true});
    fs.writeFileSync(caleCss, rez.css)
}

// Compilarea tuturor fișierelor SCSS
vFisiere = fs.readdirSync(obGlobal.folderScss);
for (let numeFis of vFisiere) {
    if (path.extname(numeFis) == ".scss") {
        compileazaScss(numeFis);
    }
}

// Monitorizarea modificărilor în folderele SCSS
fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    if (eveniment == "change" || eveniment == "rename") {
        let caleCompleta = path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)) {
            compileazaScss(caleCompleta); 
        }
    }
})

// Pornirea serverului pe portul 8080
app.listen(8080);
console.log("Serverul a pornit");
