window.addEventListener("load", function() {
    // Initialize and validate textarea
    const textarea = document.getElementById('floatingTextarea');

    textarea.addEventListener('input', function () {
        if (textarea.value.trim() === '') {
            textarea.classList.add('is-invalid');
        } else {
            textarea.classList.remove('is-invalid');
        }
    });

    // Initial validation on page load
    if (textarea.value.trim() === '') {
        textarea.classList.add('is-invalid');
    }

    // Function to replace diacritics
    function replaceDiacritics(text) {
        const diacriticsMap = {
            'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ț': 't',
            'Ă': 'A', 'Â': 'A', 'Î': 'I', 'Ș': 'S', 'Ț': 'T'
        };
        return text.replace(/[ăâîșțĂÂÎȘȚ]/g, match => diacriticsMap[match]);
    }

    // Function to mark the cheapest product in each category
    function marcheazaCeleMaiIeftineProduse() {
        var produse = Array.from(document.getElementsByClassName("produs"));
        var categorii = {};

        produse.forEach(produs => {
            let pret = parseFloat(produs.querySelector(".info-produse p:nth-of-type(1) span").innerHTML);
            let categorie = produs.querySelector(".categorie span").innerHTML;

            if (!categorii[categorie] || pret < categorii[categorie].pret) {
                categorii[categorie] = {
                    pret: pret,
                    produs: produs
                };
            }
        });

        for (let categorie in categorii) {
            let produs = categorii[categorie].produs;
            let eticheta = document.createElement("div");
            eticheta.className = "eticheta-cel-mai-ieftin";
            eticheta.innerHTML = "Cel mai ieftin";
            produs.appendChild(eticheta);
        }
    }

    // Function to update the total number of displayed products
    function updateProductCount() {
        var produse = document.getElementsByClassName("produs");
        var count = 0;

        for (let produs of produse) {
            if (produs.style.display !== "none") {
                count++;
            }
        }

        var numarProduse = document.getElementById("numar-produse");
        numarProduse.innerHTML = `Număr total de produse afișate: ${count}`;
    }

    // Filtering function
    function filtreazaProduse() {
        var inpNume = replaceDiacritics(document.getElementById("inp-nume").value.toLowerCase().trim());
        var inpPret = parseInt(document.getElementById("inp-pret").value);
        var inpCategorie = document.getElementById("inp-categorie").value.toLowerCase().trim();
        var inpDiagonalaMin = parseInt(document.getElementById("inp-diagonala-min").value);
        var inpDiagonalaMax = parseInt(document.getElementById("inp-diagonala-max").value);
        var inpGarantie = document.getElementById("inp-garantie").checked;
        var inpCalitate = Array.from(document.querySelectorAll('input[name="calitate"]:checked')).map(checkbox => checkbox.value);

        var produse = document.getElementsByClassName("produs");
        var produseVizibile = 0;

        for (let produs of produse) {
            let valNume = replaceDiacritics(produs.querySelector(".nume a").innerHTML.toLowerCase().trim());
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

            if (cond1 && cond2 && cond3 && cond4 && cond5 && cond6) {
                produs.style.display = "block";
                produseVizibile++;
            } else {
                produs.style.display = "none";
            }
        }

        var mesajFiltrare = document.getElementById("mesaj-filtrare");
        if (produseVizibile === 0) {
            if (!mesajFiltrare) {
                mesajFiltrare = document.createElement("p");
                mesajFiltrare.id = "mesaj-filtrare";
                mesajFiltrare.innerHTML = "Nu exista produse conform filtrării curente.";
                document.querySelector("#produse .grid-produse").appendChild(mesajFiltrare);
            }
        } else {
            if (mesajFiltrare) {
                mesajFiltrare.remove();
            }
        }

        updateProductCount();
        marcheazaCeleMaiIeftineProduse();
    }

    // Add onchange events for input fields
    document.getElementById("inp-nume").oninput = filtreazaProduse;
    document.getElementById("inp-pret").onchange = function() {
        document.getElementById("infoRange").innerHTML = `(${this.value})`;
        filtreazaProduse();
    };
    document.getElementById("inp-categorie").onchange = filtreazaProduse;
    document.getElementById("inp-diagonala-min").oninput = filtreazaProduse;
    document.getElementById("inp-diagonala-max").oninput = filtreazaProduse;
    document.getElementById("inp-garantie").onchange = filtreazaProduse;
    document.querySelectorAll('input[name="calitate"]').forEach(cb => cb.onchange = filtreazaProduse);

    // Reset button click event
    document.getElementById("resetare").onclick = function() {
        var confirmare = confirm("Sigur doriți să resetați filtrele? Această acțiune va elimina toate filtrele și va afișa toate produsele.");
        if (confirmare) {
            document.getElementById("inp-nume").value = "";
            document.getElementById("inp-pret").value = document.getElementById("inp-pret").min;
            document.getElementById("infoRange").innerHTML = `(${document.getElementById("inp-pret").value})`;
            document.getElementById("inp-categorie").value = "toate";
            document.getElementById("inp-diagonala-min").value = document.getElementById("inp-diagonala-min").min;  
            document.getElementById("inp-diagonala-max").value = document.getElementById("inp-diagonala-max").max;  
            document.getElementById("inp-garantie").checked = false;
            document.querySelectorAll('input[name="calitate"]').forEach(cb => cb.checked = false);

            var produse = document.getElementsByClassName("produs");
            for (let produs of produse) {
                produs.style.display = "block";
            }

            var mesajFiltrare = document.getElementById("mesaj-filtrare");
            if (mesajFiltrare) {
                mesajFiltrare.remove();
            }

            updateProductCount();
            marcheazaCeleMaiIeftineProduse();
        }
    }

    // Function to sort products
    function sortareProduse(ascendent) {
        var produse = Array.from(document.getElementsByClassName("produs"));
        produse.sort((a, b) => {
            let pretA = parseFloat(a.querySelector(".info-produse p:nth-of-type(1) span").innerHTML);
            let pretB = parseFloat(b.querySelector(".info-produse p:nth-of-type(1) span").innerHTML);

            let numeA = replaceDiacritics(a.querySelector(".nume a").innerHTML.toLowerCase());
            let numeB = replaceDiacritics(b.querySelector(".nume a").innerHTML.toLowerCase());

            if (pretA == pretB) {
                return ascendent ? numeA.localeCompare(numeB) : numeB.localeCompare(numeA);
            }
            return ascendent ? pretA - pretB : pretB - pretA;
        });

        var container = document.querySelector(".grid-produse");
        produse.forEach(produs => container.appendChild(produs));

        updateProductCount();
        marcheazaCeleMaiIeftineProduse();
    }

    document.getElementById("sortCrescNume").onclick = function() {
        sortareProduse(true);
    }

    document.getElementById("sortDescrescNume").onclick = function() {
        sortareProduse(false);
    }

    // Calculate button click event
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

        var media = suma / numarElemente;

        var preturi = Array.from(produse).map(produs => parseFloat(produs.querySelector(".info-produse p:nth-of-type(1) span").innerHTML));
        var minim = Math.min(...preturi);
        var maxim = Math.max(...preturi);

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

        document.body.appendChild(rezultatDiv);

        setTimeout(function() {
            rezultatDiv.remove();
        }, 2000);
    }

    // Initial setup on page load
    updateProductCount();
    marcheazaCeleMaiIeftineProduse();
});
