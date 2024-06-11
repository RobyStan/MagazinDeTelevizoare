function setCookie(nume, val, timpExpirare) { // timpExpirare in milisecunde
    let d = new Date();
    d.setTime(d.getTime() + timpExpirare);
    document.cookie = `${nume}=${val}; expires=${d.toUTCString()}; path=/`;
}

function getCookie(nume) {
    let vectorParametri = document.cookie.split(";"); // ["a=10","b=ceva"]
    for (let param of vectorParametri) {
        let [key, value] = param.trim().split("=");
        if (key === nume) return value;
    }
    return null;
}

function deleteCookie(nume) {
    document.cookie = `${nume}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

function deleteAllCookies() {
    let cookies = document.cookie.split(";");
    for (let cookie of cookies) {
        let eqPos = cookie.indexOf("=");
        let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
}

window.addEventListener("load", function() {
    const currentUrl = window.location.href;
    const excludedUrls = [
        "http://localhost:8080/index",
        "http://localhost:8080/index.html",
        "http://localhost:8080/index#welcome"
    ];

    if (!excludedUrls.includes(currentUrl)) {
        setCookie("ultima_pagina_accesata", currentUrl, 7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds
    }

    if (getCookie("acceptat_banner")) {
        document.getElementById("banner").style.display = "none";
    } else {
        document.getElementById("banner").style.display = "flex";
    }

    document.getElementById("ok_cookies").onclick = function() {
        // Set cookie to expire after 7 days (for testing purposes, set to 5-6 seconds)
         setCookie("acceptat_banner", true, 7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds
        // For testing:
        //setCookie("acceptat_banner", true, 6000); // 6 seconds in milliseconds
        document.getElementById("banner").style.display = "none";
    }

    let lastPage = getCookie("ultima_pagina_accesata");
    if (lastPage) {
        document.getElementById("lastPageInfo").innerText = `Ultima pagină accesată: ${lastPage}`;
    }
});
