window.addEventListener("load", function() {
    // Inițializare și validare textarea
    const textarea = document.getElementById('floatingTextarea');

    textarea.addEventListener('input', function () {
        if (textarea.value.trim() === '') {
            textarea.classList.add('is-invalid');
        } else {
            textarea.classList.remove('is-invalid');
        }
    });

    // Inițializare validare la încărcarea paginii
    if (textarea.value.trim() === '') {
        textarea.classList.add('is-invalid');
    }

    // Actualizarea valorii afișate în #infoRange în funcție de valoarea inputului #inp-pret
    document.getElementById("inp-pret").onchange = function() {
        document.getElementById("infoRange").innerHTML = `(${this.value})`;
    }

    // Evenimentul de click pentru butonul de filtrare
    document.getElementById("filtrare").onclick = function() {
        // Preluarea valorilor din inputuri pentru filtrare
        var inpNume = document.getElementById("inp-nume").value.toLowerCase().trim();
        var inpPret = parseInt(document.getElementById("inp-pret").value);
        var inpCategorie = document.getElementById("inp-categorie").value.toLowerCase().trim();
        var inpDiagonalaMin = parseInt(document.getElementById("inp-diagonala-min").value);
        var inpDiagonalaMax = parseInt(document.getElementById("inp-diagonala-max").value);
        var inpGarantie = document.getElementById("inp-garantie").checked;
        var inpCalitate = Array.from(document.querySelectorAll('input[name="calitate"]:checked')).map(checkbox => checkbox.value);

        // Selectarea tuturor produselor
        var produse = document.getElementsByClassName("produs");
        // Iterarea prin fiecare produs și aplicarea filtrului
        for (let produs of produse) {
            let valNume = produs.querySelector(".nume a").innerHTML.toLowerCase().trim();
            let cond1 = valNume.includes(inpNume);

            let valPret = parseFloat(produs.querySelector(".info-produse p:nth-of-type(1) span").innerHTML);
            let cond2 = (valPret >= inpPret);

            let valCategorie = produs.querySelector(".categorie span").innerHTML.toLowerCase().trim();
            let cond3 = (inpCategorie == "toate" || inpCategorie == valCategorie);

            let valDiagonala = parseInt(produs.querySelector(".info-produse p:nth-of-type(2) span").innerHTML);
            let cond4 = (valDiagonala >= inpDiagonalaMin && valDiagonala <= inpDiagonalaMax);

            let valGarantie = produs.querySelector(".info-produse p:nth-of-type(5) span").innerHTML === "Da";
            let cond5 = (!inpGarantie || valGarantie);

            let valCalitate = produs.querySelector(".info-produse p:nth-of-type(3) span").innerHTML.split(", ").map(item => item.trim());
            let cond6 = (inpCalitate.length == 0 || inpCalitate.some(cal => valCalitate.includes(cal)));

            // Verificarea condițiilor de filtrare și afișarea/coafarea produsului în consecință
            if (cond1 && cond2 && cond3 && cond4 && cond5 && cond6) {
                produs.style.display = "block";
            } else {
                produs.style.display = "none";
            }
        }
    }

    // Evenimentul de click pentru butonul de resetare
    document.getElementById("resetare").onclick = function() {
        // Afișarea unei ferestre de confirmare
        var confirmare = confirm("Sigur doriți să resetați filtrele? Această acțiune va elimina toate filtrele și va afișa toate produsele.");
        // Dacă utilizatorul confirmă acțiunea
        if (confirmare) {
            // Resetarea valorilor inputurilor la valorile implicite
            document.getElementById("inp-nume").value = "";
            document.getElementById("inp-pret").value = document.getElementById("inp-pret").min;
            document.getElementById("infoRange").innerHTML = `(${document.getElementById("inp-pret").value})`;
            document.getElementById("inp-categorie").value = "toate";
            document.getElementById("inp-diagonala-min").value = 0;
            document.getElementById("inp-diagonala-max").value = 100;
            document.getElementById("inp-garantie").checked = false;
            document.querySelectorAll('input[name="calitate"]').forEach(cb => cb.checked = false);

            // Afișarea tuturor produselor
            var produse = document.getElementsByClassName("produs");
            for (let produs of produse) {
                produs.style.display = "block";
            }
        }
    }

    // Evenimentele de click pentru butoanele de sortare
    

    // Funcția de sortare a produselor
    function sortareProduse(ascendent) {
        var produse = Array.from(document.getElementsByClassName("produs"));
        produse.sort((a, b) => {
            let pretA = parseFloat(a.querySelector(".info-produse p:nth-of-type(1) span").innerHTML);
            let pretB = parseFloat(b.querySelector(".info-produse p:nth-of-type(1) span").innerHTML);

            let numeA = a.querySelector(".nume a").innerHTML.toLowerCase();
            let numeB = b.querySelector(".nume a").innerHTML.toLowerCase();

            if (pretA == pretB) {
                return ascendent ? numeA.localeCompare(numeB) : numeB.localeCompare(numeA);
            }
            return ascendent ? pretA - pretB : pretB - pretA;
        });

        // Rearanjarea produselor în container
        var container = document.querySelector(".grid-produse");
        produse.forEach(produs => container.appendChild(produs));
    }
    document.getElementById("sortCrescNume").onclick = function() {
        sortareProduse(true);
    }

    document.getElementById("sortDescrescNume").onclick = function() {
        sortareProduse(false);
    }

    // Evenimentul de click pentru butonul de calculare
    document.getElementById("calculeaza").onclick = function() {
        var suma = 0;
        var numarElemente = 0;

        var produse = document.getElementsByClassName("produs");
        for (let produs of produse) {
            var stil = getComputedStyle(produs)
            if (stil.display != "none") {
                suma += parseFloat(produs.querySelector(".info-produse p:nth-of-type(1) span").innerHTML);
                numarElemente++;
            }
        }

        // Calculul mediei
        var media = suma / numarElemente;

        // Calculul minimului
        var preturi = Array.from(produse).map(produs => parseFloat(produs.querySelector(".info-produse p:nth-of-type(1) span").innerHTML));
        var minim = Math.min(...preturi);

        // Calculul maximului
        var maxim = Math.max(...preturi);

        // Crearea elementului pentru afișarea rezultatelor
        var rezultatDiv = document.createElement("div");
        rezultatDiv.style.position = "fixed";
        rezultatDiv.style.top = "50%";
        rezultatDiv.style.left = "50%";
        rezultatDiv.style.transform = "translate(-50%, -50%)";
        rezultatDiv.style.padding = "20px";
        rezultatDiv.style.background = "#fff";
        rezultatDiv.style.border = "2px solid #333";
        rezultatDiv.style.zIndex = "9999";

        rezultatDiv.innerHTML = `
            <p>Suma prețurilor: ${suma}</p>
            <p>Media prețurilor: ${media.toFixed(2)}</p>
            <p>Prețul minim: ${minim}</p>
            <p>Prețul maxim: ${maxim}</p>
        `;

        // Adăugarea div-ului cu rezultate în document
        document.body.appendChild(rezultatDiv);

        // Ștergerea div-ului după 2 secunde
        setTimeout(function() {
            rezultatDiv.remove();
        }, 2000);
    }
});
