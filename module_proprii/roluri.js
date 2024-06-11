const Drepturi = require('./drepturi.js');

/**
 * Clasa de baza pentru roluri.
 * @class
 */
class Rol {
    /**
     * Tipul rolului.
     * @type {string}
     */
    static get tip() { return "generic" }

    /**
     * Drepturile asociate rolului.
     * @type {Symbol[]}
     */
    static get drepturi() { return [] }

    constructor() {
        /**
         * Codul rolului.
         * @type {string}
         */
        this.cod = this.constructor.tip;
    }

    /**
     * Verifica daca rolul are un anumit drept.
     * @param {Symbol} drept - Dreptul de verificat.
     * @returns {boolean} True daca rolul are dreptul, altfel false.
     */
    areDreptul(drept) {
        console.log("in metoda rol!!!!");
        return this.constructor.drepturi.includes(drept);
    }
}

/**
 * Clasa pentru rolul de administrator.
 * @class
 * @extends Rol
 */
class RolAdmin extends Rol {
    static get tip() { return "admin" }

    constructor() {
        super();
    }

    /**
     * Verifica daca rolul de administrator are un anumit drept.
     * @returns {boolean} True deoarece administratorul are toate drepturile.
     */
    areDreptul() {
        return true;
    }
}

/**
 * Clasa pentru rolul de moderator.
 * @class
 * @extends Rol
 */
class RolModerator extends Rol {
    static get tip() { return "moderator" }

    /**
     * Drepturile asociate rolului de moderator.
     * @type {Symbol[]}
     */
    static get drepturi() {
        return [
            Drepturi.vizualizareUtilizatori,
            Drepturi.stergereUtilizatori
        ];
    }

    constructor() {
        super();
    }
}

/**
 * Clasa pentru rolul de client.
 * @class
 * @extends Rol
 */
class RolClient extends Rol {
    static get tip() { return "comun" }

    /**
     * Drepturile asociate rolului de client.
     * @type {Symbol[]}
     */
    static get drepturi() {
        return [
            Drepturi.cumparareProduse
        ];
    }

    constructor() {
        super();
    }
}

/**
 * Fabrica pentru crearea rolurilor.
 * @class
 */
class RolFactory {
    /**
     * Creeaza un rol in functie de tipul specificat.
     * @param {string} tip - Tipul rolului de creat.
     * @returns {Rol} Instanta a rolului creat.
     */
    static creeazaRol(tip) {
        switch (tip) {
            case RolAdmin.tip: return new RolAdmin();
            case RolModerator.tip: return new RolModerator();
            case RolClient.tip: return new RolClient();
            default: throw new Error("Tip de rol necunoscut");
        }
    }
}

module.exports = {
    RolFactory: RolFactory,
    RolAdmin: RolAdmin
};