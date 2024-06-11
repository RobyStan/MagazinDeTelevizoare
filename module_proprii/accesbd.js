const { Client, Pool } = require("pg");

/**
 * Clasa pentru accesul la baza de date.
 */
class AccesBD {
    static #instanta = null;
    static #initializat = false;

    constructor() {
        if (AccesBD.#instanta) {
            throw new Error("Deja a fost instantiat");
        } else if (!AccesBD.#initializat) {
            throw new Error("Trebuie apelat doar din getInstanta; fara sa fi aruncat vreo eroare");
        }
    }

    /**
     * Initializeaza conexiunea la baza de date locala.
     */
    initLocal() {
        this.client = new Client({
            database: "cti_2024",
            user: "roby",
            password: "roby",
            host: "localhost",
            port: 5432
        });
        this.client.connect();
    }

    /**
     * Returneaza clientul pentru conexiunea la baza de date.
     * @returns {Client} Clientul pentru conexiunea la baza de date.
     */
    getClient() {
        if (!AccesBD.#instanta) {
            throw new Error("Nu a fost instantiata clasa");
        }
        return this.client;
    }

    /**
     * Returneaza instanta unica a clasei.
     * @param {Object} [options={}] - Optiuni pentru initializare.
     * @param {string} [options.init="local"] - Tipul de conexiune ("local", "render", etc.)
     * @returns {AccesBD} Instanta unica a clasei AccesBD.
     */
    static getInstanta({ init = "local" } = {}) {
        console.log(this); // this-ul e clasa nu instanta pt ca metoda statica
        if (!this.#instanta) {
            this.#initializat = true;
            this.#instanta = new AccesBD();

            // initializarea poate arunca erori
            // vom adauga aici cazurile de initializare
            // pentru baza de date cu care vrem sa lucram
            try {
                switch (init) {
                    case "local": this.#instanta.initLocal();
                }
                // daca ajunge aici inseamna ca nu s-a produs eroare la initializare
            } catch (e) {
                console.error("Eroare la initializarea bazei de date!");
            }
        }
        return this.#instanta;
    }

    /**
     * Genereaza conditia WHERE dintr-un vector de vectori de conditii.
     * @param {string[][]} conditii - Un vector de vectori de conditii.
     * @returns {string} Conditia WHERE generata.
     */
    #genereazaConditiiWhere(conditii) {
        return conditii.map(cond => `(${cond.join(" and ")})`).join(" or ");
    }

    /**
     * Selecteaza inregistrari din baza de date.
     * @param {ObiectQuerySelect} obj - Un obiect cu datele pentru query.
     * @param {QueryCallBack} callback - O functie callback cu 2 parametri: eroare si rezultatul queryului.
     * @param {Array} [parametriQuery=[]] - Parametri pentru query.
     */
    select({ tabel = "", campuri = [], conditiiAnd = [] } = {}, callback, parametriQuery = []) {
        let conditieWhere = "";
        if (conditiiAnd.length > 0)
            conditieWhere = `where ${this.#genereazaConditiiWhere(conditiiAnd)}`;
        let comanda = `select ${campuri.join(",")} from ${tabel} ${conditieWhere}`;
        console.error(comanda);
        this.client.query(comanda, parametriQuery, callback);
    }

    /**
     * Selecteaza inregistrari din baza de date (versiune asincrona).
     * @param {ObiectQuerySelect} obj - Un obiect cu datele pentru query.
     * @returns {Promise<Object>} Rezultatul query-ului.
     */
    async selectAsync({ tabel = "", campuri = [], conditiiAnd = [] } = {}) {
        let conditieWhere = "";
        if (conditiiAnd.length > 0)
            conditieWhere = `where ${this.#genereazaConditiiWhere(conditiiAnd)}`;
        let comanda = `select ${campuri.join(",")} from ${tabel} ${conditieWhere}`;
        console.error("selectAsync:", comanda);
        try {
            let rez = await this.client.query(comanda);
            console.log("selectasync: ", rez);
            return rez;
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    /**
     * Insereaza inregistrari in baza de date.
     * @param {Object} obj - Un obiect cu datele pentru query.
     * @param {string} obj.tabel - Numele tabelului.
     * @param {Object} obj.campuri - Un obiect cu campurile de inserat si valorile acestora.
     * @param {QueryCallBack} callback - O functie callback cu 2 parametri: eroare si rezultatul queryului.
     */
    insert({ tabel = "", campuri = {} } = {}, callback) {
        console.log("-------------------------------------------");
        console.log(Object.keys(campuri).join(","));
        console.log(Object.values(campuri).join(","));
        let comanda = `insert into ${tabel}(${Object.keys(campuri).join(",")}) values (${Object.values(campuri).map((x) => `'${x}'`).join(",")})`;
        console.log(comanda);
        this.client.query(comanda, callback);
    }

    /**
     * Actualizeaza inregistrari in baza de date.
     * @param {Object} obj - Un obiect cu datele pentru query.
     * @param {string} obj.tabel - Numele tabelului.
     * @param {Object} obj.campuri - Un obiect cu campurile de actualizat si valorile acestora.
     * @param {string[][]} obj.conditiiAnd - Lista de vectori de stringuri cu conditii pentru where.
     * @param {QueryCallBack} callback - O functie callback cu 2 parametri: eroare si rezultatul queryului.
     * @param {Array} [parametriQuery=[]] - Parametri pentru query.
     */
    update({ tabel = "", campuri = {}, conditiiAnd = [] } = {}, callback, parametriQuery = []) {
        let campuriActualizate = [];
        for (let prop in campuri)
            campuriActualizate.push(`${prop}='${campuri[prop]}'`);
        let conditieWhere = "";
        if (conditiiAnd.length > 0)
            conditieWhere = `where ${this.#genereazaConditiiWhere(conditiiAnd)}`;
        let comanda = `update ${tabel} set ${campuriActualizate.join(", ")} ${conditieWhere}`;
        console.log(comanda);
        this.client.query(comanda, callback);
    }

    /**
     * Actualizeaza inregistrari in baza de date folosind parametri.
     * @param {Object} obj - Un obiect cu datele pentru query.
     * @param {string} obj.tabel - Numele tabelului.
     * @param {string[]} obj.campuri - Lista de campuri de actualizat.
     * @param {Array} obj.valori - Lista de valori pentru campuri.
     * @param {string[][]} obj.conditiiAnd - Lista de vectori de stringuri cu conditii pentru where.
     * @param {QueryCallBack} callback - O functie callback cu 2 parametri: eroare si rezultatul queryului.
     * @param {Array} [parametriQuery=[]] - Parametri pentru query.
     */
    updateParametrizat({ tabel = "", campuri = [], valori = [], conditiiAnd = [] } = {}, callback, parametriQuery = []) {
        if (campuri.length != valori.length)
            throw new Error("Numarul de campuri difera de nr de valori");
        let campuriActualizate = [];
        for (let i = 0; i < campuri.length; i++)
            campuriActualizate.push(`${campuri[i]}=$${i + 1}`);
        let conditieWhere = "";
        if (conditiiAnd.length > 0)
            conditieWhere = `where ${this.#genereazaConditiiWhere(conditiiAnd)}`;
        let comanda = `update ${tabel} set ${campuriActualizate.join(", ")} ${conditieWhere}`;
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1111", comanda);
        this.client.query(comanda, valori, callback);
    }

    /**
     * Sterge inregistrari din baza de date.
     * @param {Object} obj - Un obiect cu datele pentru query.
     * @param {string} obj.tabel - Numele tabelului.
     * @param {string[][]} obj.conditiiAnd - Lista de vectori de stringuri cu conditii pentru where.
     * @param {QueryCallBack} callback - O functie callback cu 2 parametri: eroare si rezultatul queryului.
     */
    delete({ tabel = "", conditiiAnd = [] } = {}, callback) {
        let conditieWhere = "";
        if (conditiiAnd.length > 0)
            conditieWhere = `where ${this.#genereazaConditiiWhere(conditiiAnd)}`;
        let comanda = `delete from ${tabel} ${conditieWhere}`;
        console.log(comanda);
        this.client.query(comanda, callback);
    }

    /**
     * Executa un query generic.
     * @param {string} comanda - Comanda SQL de executat.
     * @param {QueryCallBack} callback - O functie callback cu 2 parametri: eroare si rezultatul queryului.
     */
    query(comanda, callback) {
        this.client.query(comanda, callback);
    }
}

module.exports = AccesBD;
