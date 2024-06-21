class Produs{

    constructor({id, nume, locatie_disponibila, descriere, pret, categorie, calitate,imagine,}={}) {

        for(let prop in arguments[0]){
            this[prop]=arguments[0][prop]
        }

    }

}