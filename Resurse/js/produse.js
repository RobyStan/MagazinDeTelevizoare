document.addEventListener("DOMContentLoaded", function() {
    // se execută după ce tot conținutul HTML a fost complet încărcat si Document Object Model incarcat

    const textarea = document.getElementById('floatingTextarea');

    const validateTextarea = () => {
        if (textarea.value.trim() === '') {
            textarea.classList.add('is-invalid');
        } else {
            textarea.classList.remove('is-invalid');
        }
    };

    textarea.addEventListener('input', validateTextarea);
    // Adaugă un eveniment de tip 'input' pe textarea care va apela funcția 'validateTextarea' la fiecare modificare de conținut.

    validateTextarea();
    // Validează textarea inițial, pentru cazul în care există deja un text în textarea la încărcarea paginii.

    //bonus 7
    function replaceDiacritics(text) {
        const diacriticsMap = {
            'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ț': 't',
            'Ă': 'A', 'Â': 'A', 'Î': 'I', 'Ș': 'S', 'Ț': 'T'
        };
        // Un obiect care mapează diacriticele la caracterele lor fără diacritice.

        return text.replace(/[ăâîșțĂÂÎȘȚ]/g, match => diacriticsMap[match]);
        // Înlocuiește fiecare caracter care se potrivește cu diacriticele din text folosind funcția de mapare 'diacriticsMap'.
    }
    //bonus 7

    //bonus 14
    function marcheazaCeleMaiIeftineProduse() {
        const produse = Array.from(document.getElementsByClassName("produs"));
        // Obține toate elementele cu clasa 'produs' și le transformă într-un array.

        const categorii = {};
        // Un obiect pentru stocarea celui mai ieftin produs din fiecare categorie.

        produse.forEach(produs => {
            const pret = parseFloat(produs.querySelector(".info-produse p:nth-of-type(1) span").innerHTML);
            // Obține prețul produsului și îl convertește într-un număr cu virgulă mobilă.
            const categorie = produs.querySelector(".categorie span").innerHTML;
            // Obține categoria produsului.

            if (!categorii[categorie] || pret < categorii[categorie].pret) {
                // Dacă categoria nu există în obiectul categorii sau prețul curent este mai mic decât prețul stocat pentru această categorie:
                categorii[categorie] = { pret, produs };
                // Actualizează obiectul categorii cu produsul curent și prețul său.
            }
        });

        Object.values(categorii).forEach(({ produs }) => {
            // Iterează prin valorile obiectului categorii.
            const eticheta = document.createElement("div");
            // Creează un nou element div pentru eticheta.
            eticheta.className = "eticheta-cel-mai-ieftin";
            // Setează clasa div-ului la 'eticheta-cel-mai-ieftin'.
            eticheta.innerHTML = "Cel mai ieftin";
            // Setează conținutul div-ului la textul "Cel mai ieftin".
            produs.appendChild(eticheta);
            // Adaugă eticheta ca fiu al elementului produs.
        });
    }
    //bonus 14
    //bonus 15
    function updateProductCount() {
        const produse = document.getElementsByClassName("produs");
        const count = Array.from(produse).filter(produs => produs.style.display !== "none").length;
        // Numără câte produse sunt afișate (nu au stilul display: none).
        document.getElementById("numar-produse").innerHTML = `Număr total de produse afișate: ${count}`;
        // Actualizează conținutul elementului cu id-ul 'numar-produse' cu numărul total de produse afișate.
    }
    //bonus 15
    //bonus 3
    function filtreazaProduse() {
        const inpNume = replaceDiacritics(document.getElementById("inp-nume").value.toLowerCase().trim());
        // Obține și normalizează (fără diacritice, în litere mici, fără spații la început și sfârșit) valoarea input-ului pentru nume.
        const inpPret = parseInt(document.getElementById("inp-pret").value);
        // Obține și convertește în număr valoarea input-ului pentru preț.
        const inpCategorie = document.getElementById("inp-categorie").value.toLowerCase().trim();
        // Obține și normalizează valoarea input-ului pentru categorie.
        const inpDiagonalaMin = parseInt(document.getElementById("inp-diagonala-min").value);
        // Obține și convertește în număr valoarea input-ului pentru diagonala minimă.
        const inpDiagonalaMax = parseInt(document.getElementById("inp-diagonala-max").value);
        // Obține și convertește în număr valoarea input-ului pentru diagonala maximă.
        const inpGarantie = document.getElementById("inp-garantie").checked;
        // Obține valoarea input-ului pentru garanție (true/false).
        const inpCalitate = Array.from(document.querySelectorAll('input[name="calitate"]:checked')).map(checkbox => checkbox.value);
        // Obține valorile input-urilor pentru calitate care sunt bifate.

        const produse = document.getElementsByClassName("produs");
        let produseVizibile = 0;

        Array.from(produse).forEach(produs => {
            const valNume = replaceDiacritics(produs.querySelector(".nume a").innerHTML.toLowerCase().trim());
            // Obține și normalizează valoarea numelui produsului.
            const cond1 = valNume.includes(inpNume);
            // Verifică dacă numele produsului conține valoarea input-ului pentru nume.

            const valPret = parseFloat(produs.querySelector(".info-produse p:nth-of-type(1) span").innerHTML);
            // Obține și convertește în număr valoarea prețului produsului.
            const cond2 = valPret >= inpPret;
            // Verifică dacă prețul produsului este mai mare sau egal cu valoarea input-ului pentru preț.

            const valCategorie = produs.querySelector(".categorie span").innerHTML.toLowerCase().trim();
            // Obține și normalizează valoarea categoriei produsului.
            const cond3 = inpCategorie === "toate" || inpCategorie === valCategorie;
            // Verifică dacă categoria produsului este egală cu valoarea input-ului pentru categorie sau dacă input-ul este 'toate'.

            const valDiagonala = parseInt(produs.querySelector(".info-produse p:nth-of-type(2) span").innerHTML);
            // Obține și convertește în număr valoarea diagonalei produsului.
            const cond4 = valDiagonala >= inpDiagonalaMin && valDiagonala <= inpDiagonalaMax;
            // Verifică dacă diagonala produsului este între valorile input-urilor pentru diagonala minimă și maximă.

            const valGarantie = produs.querySelector(".info-produse p:nth-of-type(5) span").innerHTML === "Da";
            // Obține valoarea garanției produsului.
            const cond5 = !inpGarantie || valGarantie;
            // Verifică dacă input-ul pentru garanție este bifat și dacă produsul are garanție.

            const valCalitate = produs.querySelector(".info-produse p:nth-of-type(3) span").innerHTML.split(", ").map(item => item.trim());
            // Obține și normalizează valoarea calității produsului.
            const cond6 = inpCalitate.length === 0 || inpCalitate.some(cal => valCalitate.includes(cal));
            // Verifică dacă input-urile pentru calitate sunt bifate și dacă calitatea produsului conține aceste valori.

            // Afișează produsul dacă toate condițiile sunt îndeplinite.
            if (cond1 && cond2 && cond3 && cond4 && cond5 && cond6) {
                produs.style.display = "block";
                produseVizibile++;
            } else {
                // Ascunde produsul dacă oricare dintre condiții nu este îndeplinită.
                produs.style.display = "none";
            }
        });

        const mesajFiltrare = document.getElementById("mesaj-filtrare");
        // Obține elementul pentru mesajul de filtrare.
        if (produseVizibile === 0) {
            // Dacă nu există produse vizibile:
            if (!mesajFiltrare) {
                // Dacă mesajul de filtrare nu există deja:
                const newMesajFiltrare = document.createElement("p");
                // Creează un nou element p pentru mesaj.
                newMesajFiltrare.id = "mesaj-filtrare";
                // Setează id-ul mesajului.
                newMesajFiltrare.innerHTML = "Nu exista produse conform filtrării curente.";
                // Setează textul mesajului.
                document.querySelector("#produse .grid-produse").appendChild(newMesajFiltrare);
                // Adaugă mesajul de filtrare în DOM.
            }
        } else if (mesajFiltrare) {
            // Dacă există produse vizibile și mesajul de filtrare există:
            mesajFiltrare.remove();
            // Elimină mesajul de filtrare din DOM.
        }

        updateProductCount();
        // Actualizează numărul de produse afișate.
        marcheazaCeleMaiIeftineProduse();
        // Marchează cele mai ieftine produse din fiecare categorie.
        saveFilters();
        // Salvează filtrele curente.
    }
    //bonus 3

             
    function saveFilters() {
        // Funcția salvează filtrele curente în localStorage.
        if (document.getElementById("salveaza-filtrare").checked) {
            // Dacă checkbox-ul pentru salvarea filtrării este bifat:
            const filters = {
                nume: document.getElementById("inp-nume").value,
                pret: document.getElementById("inp-pret").value,
                categorie: document.getElementById("inp-categorie").value,
                diagonalaMin: document.getElementById("inp-diagonala-min").value,
                diagonalaMax: document.getElementById("inp-diagonala-max").value,
                garantie: document.getElementById("inp-garantie").checked,
                calitate: Array.from(document.querySelectorAll('input[name="calitate"]:checked')).map(cb => cb.value),
                salveazaFiltrare: document.getElementById("salveaza-filtrare").checked
            };
            // Creează un obiect filters cu valorile input-urilor curente.
            localStorage.setItem("filters", JSON.stringify(filters));
            // Salvează obiectul filters în localStorage.
        } else {
            // Dacă checkbox-ul pentru salvarea filtrării nu este bifat:
            localStorage.removeItem("filters");
            // Elimină filtrele din localStorage.
        }
    }

    function loadFilters() {
        // Funcția încarcă filtrele salvate din localStorage.
        const savedFilters = JSON.parse(localStorage.getItem("filters"));
        // Obține și parsează filtrele salvate din localStorage.
        if (savedFilters) {
            // Dacă există filtre salvate:
            document.getElementById("inp-nume").value = savedFilters.nume;
            document.getElementById("inp-pret").value = savedFilters.pret;
            document.getElementById("infoRange").innerHTML = `(${savedFilters.pret})`;
            document.getElementById("inp-categorie").value = savedFilters.categorie;
            document.getElementById("inp-diagonala-min").value = savedFilters.diagonalaMin;
            document.getElementById("inp-diagonala-max").value = savedFilters.diagonalaMax;
            document.getElementById("inp-garantie").checked = savedFilters.garantie;
            savedFilters.calitate.forEach(value => {
                document.getElementById(`calitate-${value.toLowerCase()}`).checked = true;
            });
            document.getElementById("salveaza-filtrare").checked = savedFilters.salveazaFiltrare;
            // Setează valorile input-urilor din pagina curentă cu valorile salvate.
        }
    }

    //bonus 4
    // Adaugă evenimente de filtrare pentru fiecare input relevant
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

    // Adaugă un eveniment de schimbare pentru checkbox-ul de salvare a filtrării
    document.getElementById("salveaza-filtrare").onchange = saveFilters;
    //bonus 4

    // Adaugă un eveniment de resetare a filtrelor
    document.getElementById("resetare").onclick = function() {
        if (confirm("Sigur doriți să resetați filtrele? Această acțiune va elimina toate filtrele și va afișa toate produsele.")) {
            document.getElementById("inp-nume").value = "";
            document.getElementById("inp-pret").value = document.getElementById("inp-pret").min;
            document.getElementById("infoRange").innerHTML = `(${document.getElementById("inp-pret").value})`;
            document.getElementById("inp-categorie").value = "toate";
            document.getElementById("inp-diagonala-min").value = document.getElementById("inp-diagonala-min").min;
            document.getElementById("inp-diagonala-max").value = document.getElementById("inp-diagonala-max").max;
            document.getElementById("inp-garantie").checked = false;
            document.querySelectorAll('input[name="calitate"]').forEach(cb => cb.checked = false);
            document.getElementById("salveaza-filtrare").checked = false;
            localStorage.removeItem("filters");

            const produse = document.getElementsByClassName("produs");
            Array.from(produse).forEach(produs => {
                produs.style.display = "block";
            });

            const mesajFiltrare = document.getElementById("mesaj-filtrare");
            if (mesajFiltrare) {
                mesajFiltrare.remove();
            }

            updateProductCount();
            marcheazaCeleMaiIeftineProduse();
        }
    };

    function sortareProduse(ascendent) {
        const produse = Array.from(document.getElementsByClassName("produs"));
        produse.sort((a, b) => {
            const pretA = parseFloat(a.querySelector(".info-produse p:nth-of-type(1) span").innerHTML);
            const pretB = parseFloat(b.querySelector(".info-produse p:nth-of-type(1) span").innerHTML);
            const numeA = replaceDiacritics(a.querySelector(".nume a").innerHTML.toLowerCase());
            const numeB = replaceDiacritics(b.querySelector(".nume a").innerHTML.toLowerCase());

            if (pretA === pretB) {
                return ascendent ? numeA.localeCompare(numeB) : numeB.localeCompare(numeA);
            }
            return ascendent ? pretA - pretB : pretB - pretA;
        });

        const container = document.querySelector(".grid-produse");
        produse.forEach(produs => container.appendChild(produs));

        container.style.display = "grid";
        container.style.gridTemplateColumns = "repeat(3, 1fr)";
        container.style.gap = "10px";

        updateProductCount();
        marcheazaCeleMaiIeftineProduse();
    }

    document.getElementById("sortCrescNume").onclick = function() {
        sortareProduse(true);
    };

    document.getElementById("sortDescrescNume").onclick = function() {
        sortareProduse(false);
    };

    document.getElementById("calculeaza").onclick = function() {
        let suma = 0;
        let numarElemente = 0;
        const produse = document.getElementsByClassName("produs");
        const preturi = [];

        Array.from(produse).forEach(produs => {
            if (getComputedStyle(produs).display !== "none") {
                const pret = parseFloat(produs.querySelector(".info-produse p:nth-of-type(1) span").innerHTML);
                suma += pret;
                numarElemente++;
                preturi.push(pret);
            }
        });

        const media = suma / numarElemente;
        const minim = Math.min(...preturi);
        const maxim = Math.max(...preturi);

        const rezultatDiv = document.createElement("div");
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

        setTimeout(() => {
            rezultatDiv.remove();
        }, 2000);
    };

    // Funcționalitatea de comparare produse
    let comparareProduse = JSON.parse(localStorage.getItem("comparareProduse")) || [];
    const containerComparare = document.createElement("div");
    containerComparare.id = "container-comparare";
    containerComparare.style.position = "fixed";
    containerComparare.style.bottom = "10px";
    containerComparare.style.right = "10px";
    containerComparare.style.background = "#fff";
    containerComparare.style.border = "1px solid #ccc";
    containerComparare.style.padding = "10px";
    containerComparare.style.zIndex = "1000";

    function updateComparareContainer() {
        containerComparare.innerHTML = comparareProduse.map((produs, index) => `
            <div>
                ${produs.nume}
                <button class="sterge-comparare" data-index="${index}">Șterge</button>
            </div>
        `).join('') + (comparareProduse.length == 2 ? '<button id="afiseaza-comparare">Afișează</button>' : '');

        if (comparareProduse.length > 0) {
            document.body.appendChild(containerComparare);
        } else if (containerComparare.parentNode) {
            containerComparare.parentNode.removeChild(containerComparare);
        }

        localStorage.setItem("comparareProduse", JSON.stringify(comparareProduse));
    }

    function adaugaLaComparare(produs) {
        if (comparareProduse.length < 2) {
            comparareProduse.push(produs);
            updateComparareContainer();
        }

        if (comparareProduse.length == 2) {
            document.querySelectorAll('.buton-compara').forEach(btn => {
                btn.disabled = true;
                btn.title = "ștergeți un produs din lista de comparare";
            });
        }
    }

    function stergeDinComparare(index) {
        comparareProduse.splice(index, 1);
        updateComparareContainer();

        if (comparareProduse.length < 2) {
            document.querySelectorAll('.buton-compara').forEach(btn => {
                btn.disabled = false;
                btn.title = "";
            });
        }
    }

    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('buton-compara')) {
            const produsElement = event.target.closest('.produs');
            const produs = {
                id: produsElement.id,
                nume: produsElement.querySelector('.nume a').innerText,
                specificatii: {
                    pret: produsElement.querySelector(".info-produse p:nth-of-type(1) span").innerText,
                    diagonala: produsElement.querySelector(".info-produse p:nth-of-type(2) span").innerText,
                    calitate: produsElement.querySelector(".info-produse p:nth-of-type(3) span").innerText,
                    garantie: produsElement.querySelector(".info-produse p:nth-of-type(5) span").innerText,
                    categorie: produsElement.querySelector(".categorie span").innerText
                }
            };
            adaugaLaComparare(produs);
        } else if (event.target.classList.contains('sterge-comparare')) {
            const index = parseInt(event.target.getAttribute('data-index'), 10);
            stergeDinComparare(index);
        } else if (event.target.id === 'afiseaza-comparare') {
            const url = "/comparare"; 
            const comparareData = comparareProduse.map(p => p.specificatii);
            const params = new URLSearchParams();
            params.set("data", JSON.stringify(comparareData));
            window.open(`${url}?${params.toString()}`);
        }
    });

    // Persistența containerului
    if (comparareProduse.length > 0) {
        updateComparareContainer();
    }

    // Adăugarea butoanelor de comparare în pagină
    document.querySelectorAll('.produs').forEach(produsElement => {
        const butonCompara = document.createElement('button');
        butonCompara.className = 'buton-compara';
        butonCompara.innerText = 'Compară';
        produsElement.appendChild(butonCompara);
    });

    loadFilters();
    filtreazaProduse();
    updateProductCount();
    marcheazaCeleMaiIeftineProduse();
});
