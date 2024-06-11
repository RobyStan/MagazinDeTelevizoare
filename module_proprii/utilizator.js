const AccesBD = require('./accesbd.js');
const parole = require('./parole.js');
const { RolFactory } = require('./roluri.js');
const crypto = require("crypto");
const nodemailer = require("nodemailer");

/**
 * Clasa pentru gestionarea utilizatorilor.
 * @class
 */
class Utilizator {
    static tipConexiune = "local";
    static tabel = "utilizatori";
    static parolaCriptare = "tehniciweb";
    static emailServer = "stanrobycti2024@gmail.com";
    static lungimeCod = 64;
    static numeDomeniu = "localhost:8080";
    #eroare;

    /**
     * Creeaza un nou utilizator.
     * @param {Object} param0 - Parametrii pentru utilizator.
     * @param {number} param0.id - ID-ul utilizatorului.
     * @param {string} param0.username - Username-ul utilizatorului.
     * @param {string} param0.nume - Numele utilizatorului.
     * @param {string} param0.prenume - Prenumele utilizatorului.
     * @param {string} param0.email - Email-ul utilizatorului.
     * @param {string} param0.parola - Parola utilizatorului.
     * @param {Object} param0.rol - Rolul utilizatorului.
     * @param {string} [param0.culoare_chat="black"] - Culoarea chat-ului utilizatorului.
     * @param {string} param0.poza - Poza utilizatorului.
     */
    constructor({ id, username, nume, prenume, email, parola, rol, culoare_chat = "black", poza } = {}) {
        this.id = id;

        // optional sa facem asta in constructor
        try {
            if (this.checkUsername(username))
                this.username = username;
        } catch (e) { this.#eroare = e.message }

        for (let prop in arguments[0]) {
            this[prop] = arguments[0][prop]
        }
        if (this.rol)
            this.rol = this.rol.cod ? RolFactory.creeazaRol(this.rol.cod) : RolFactory.creeazaRol(this.rol);
        console.log(this.rol);

        this.#eroare = "";
    }

    /**
     * Verifica daca numele este valid.
     * @param {string} nume - Numele de verificat.
     * @returns {boolean} True daca numele este valid, altfel false.
     */
    checkName(nume) {
        return nume != "" && nume.match(new RegExp("^[A-Z][a-z]+$"));
    }

    /**
     * Seteaza numele utilizatorului.
     * @param {string} nume - Numele de setat.
     * @throws {Error} Daca numele este invalid.
     */
    set setareNume(nume) {
        if (this.checkName(nume)) this.nume = nume
        else {
            throw new Error("Nume gresit")
        }
    }

    /**
     * Seteaza username-ul utilizatorului.
     * @param {string} username - Username-ul de setat.
     * @throws {Error} Daca username-ul este invalid.
     */
    set setareUsername(username) {
        if (this.checkUsername(username)) this.username = username
        else {
            throw new Error("Username gresit")
        }
    }

    /**
     * Verifica daca username-ul este valid.
     * @param {string} username - Username-ul de verificat.
     * @returns {boolean} True daca username-ul este valid, altfel false.
     */
    checkUsername(username) {
        return username != "" && username.match(new RegExp("^[A-Za-z0-9#_./]+$"));
    }

    /**
     * Cripteaza parola utilizatorului.
     * @param {string} parola - Parola de criptat.
     * @returns {string} Parola criptata.
     */
    static criptareParola(parola) {
        return crypto.scryptSync(parola, Utilizator.parolaCriptare, Utilizator.lungimeCod).toString("hex");
    }

    /**
     * Salveaza utilizatorul in baza de date.
     */
    salvareUtilizator() {
        let parolaCriptata = Utilizator.criptareParola(this.parola);
        let utiliz = this;
        let token = parole.genereazaToken(100);
        AccesBD.getInstanta(Utilizator.tipConexiune).insert({
            tabel: Utilizator.tabel,
            campuri: {
                username: this.username,
                nume: this.nume,
                prenume: this.prenume,
                parola: parolaCriptata,
                email: this.email,
                culoare_chat: this.culoare_chat,
                cod: token,
                poza: this.poza
            }
        }, function (err, rez) {
            if (err)
                console.log(err);
            else
                utiliz.trimiteMail("Te-ai inregistrat cu succes", "Username-ul tau este " + utiliz.username,
                    `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este ${utiliz.username}.</p> <p><a href='http://${Utilizator.numeDomeniu}/cod/${utiliz.username}/${token}'>Click aici pentru confirmare</a></p>`,
                )
        });
    }

    /**
     * Trimite un email utilizatorului.
     * @param {string} subiect - Subiectul email-ului.
     * @param {string} mesajText - Mesajul text al email-ului.
     * @param {string} mesajHtml - Mesajul HTML al email-ului.
     * @param {Object[]} [atasamente=[]] - Atasamentele email-ului.
     * @returns {Promise<void>}
     */
    async trimiteMail(subiect, mesajText, mesajHtml, atasamente = []) {
        var transp = nodemailer.createTransport({
            service: "gmail",
            secure: false,
            auth: {// date login 
                user: Utilizator.emailServer,
                pass: "gqfy ofyh saev hxqn"
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        // genereaza html
        await transp.sendMail({
            from: Utilizator.emailServer,
            to: this.email,
            subject: subiect,
            text: mesajText,
            html: mesajHtml,
            attachments: atasamente
        });
        console.log("trimis mail");
    }

    /**
     * Obtine un utilizator dupa username (asincron).
     * @param {string} username - Username-ul utilizatorului.
     * @returns {Promise<Utilizator|null>} Utilizatorul gasit sau null daca nu exista.
     */
    static async getUtilizDupaUsernameAsync(username) {
        if (!username) return null;
        try {
            let rezSelect = await AccesBD.getInstanta(Utilizator.tipConexiune).selectAsync(
                {
                    tabel: "utilizatori",
                    campuri: ['*'],
                    conditiiAnd: [`username='${username}'`]
                });
            if (rezSelect.rowCount != 0) {
                return new Utilizator(rezSelect.rows[0]);
            } else {
                console.log("getUtilizDupaUsernameAsync: Nu am gasit utilizatorul");
                return null;
            }
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    /**
     * Obtine un utilizator dupa username.
     * @param {string} username - Username-ul utilizatorului.
     * @param {Object} obparam - Parametri suplimentari.
     * @param {function} proceseazaUtiliz - Functie callback pentru procesarea utilizatorului.
     * @returns {void}
     */
    static getUtilizDupaUsername(username, obparam, proceseazaUtiliz) {
        if (!username) return null;
        let eroare = null;
        AccesBD.getInstanta(Utilizator.tipConexiune).select({ tabel: "utilizatori", campuri: ['*'], conditiiAnd: [`username='${username}'`] }, function (err, rezSelect) {
            if (err) {
                console.error("Utilizator:", err);
                eroare = -2;
            } else if (rezSelect.rowCount == 0) {
                eroare = -1;
            }
            let u = new Utilizator(rezSelect.rows[0]);
            proceseazaUtiliz(u, obparam, eroare);
        });
    }

    /**
     * Verifica daca utilizatorul are un anumit drept.
     * @param {Symbol} drept - Dreptul de verificat.
     * @returns {boolean} True daca utilizatorul are dreptul, altfel false.
     */
    areDreptul(drept) {
        return this.rol.areDreptul(drept);
    }
}

module.exports = { Utilizator: Utilizator };
