DROP TYPE IF EXISTS branduri;
DROP TYPE IF EXISTS produse;

CREATE TYPE branduri AS ENUM( 'Samsung', 'Philips', 'Sony', 'LG'); /*branduri produse*/
CREATE TYPE produse AS ENUM('televizoare', 'cabluri', 'telecomenzi'); /*tipuri de produse*/


CREATE TABLE IF NOT EXISTS televizoare (
   id serial PRIMARY KEY,
   nume VARCHAR(50) UNIQUE NOT NULL,
   locatie_disponibila VARCHAR(50) NOT NULL,
   descriere TEXT,
   pret NUMERIC(8,2) NOT NULL,
   tip_produs produse DEFAULT 'televizoare',
   diagonala INT NOT NULL CHECK (diagonala>=0), /* diagonala de tip intreg*/
   categorie branduri DEFAULT 'Samsung',
   calitate VARCHAR [], --pot sa nu fie specificare deci nu punem NOT NULL vectori de string-uri HD 4K 8K
   garantie BOOLEAN NOT NULL DEFAULT FALSE,  --garantie
   imagine VARCHAR(300),
   data_adaugare TIMESTAMP DEFAULT current_timestamp
);

INSERT INTO televizoare (nume, locatie_disponibila, descriere, pret, diagonala, categorie, calitate, imagine)
VALUES ('Televizor Smart LED', 'Magazin Online', 'Televizor LED Smart cu rezoluție 4K', 1500.00, 55, 'Samsung', '{HD, 4K}', 'smart_led_tv.jpg');

INSERT INTO televizoare (nume, locatie_disponibila, descriere, pret, diagonala, categorie, calitate, imagine)
VALUES ('Televizor OLED', 'Showroom', 'Televizor OLED ultra-subțire cu rezoluție 8K', 3000.00, 65, 'Sony', '{4K, 8K}', 'oled_tv.jpg');

INSERT INTO televizoare (nume, locatie_disponibila, descriere, pret, diagonala, categorie, calitate, garantie, imagine)
VALUES ('Televizor LCD', 'Magazin Fizic', 'Televizor LCD cu rezoluție Full HD', 800.00, 42, 'LG', '{HD}', TRUE, 'lcd_tv.jpg');

INSERT INTO televizoare (nume, locatie_disponibila, descriere, pret, diagonala, categorie, calitate, garantie, imagine)
VALUES ('Televizor QLED', 'Depozit Central', 'Televizor QLED cu rezoluție 4K și tehnologie Quantum Dot', 2000.00, 50, 'Samsung', '{4K}', TRUE, 'qled_tv.jpg');

INSERT INTO televizoare (nume, locatie_disponibila, descriere, pret, diagonala, categorie, calitate, garantie, imagine)
VALUES ('Televizor Smart Android', 'Magazin Online', 'Televizor Smart cu sistem de operare Android și rezoluție 4K', 1700.00, 50, 'Philips', '{4K}', TRUE, 'smart_android_tv.jpg');

INSERT INTO televizoare (nume, locatie_disponibila, descriere, pret, diagonala, categorie, calitate, imagine)
VALUES ('Televizor Plasma', 'Showroom', 'Televizor Plasma cu rezoluție Full HD', 1100.00, 60, 'Panasonic', '{HD}', 'plasma_tv.jpg');

INSERT INTO televizoare (nume, locatie_disponibila, descriere, pret, diagonala, categorie, calitate, garantie, imagine)
VALUES ('Televizor 8K Ultra HD', 'Magazin Fizic', 'Televizor cu rezoluție 8K Ultra HD și diagonala mare', 5000.00, 75, 'Samsung', '{8K}', TRUE, '8k_ultra_hd_tv.jpg');

INSERT INTO televizoare (nume, locatie_disponibila, descriere, pret, diagonala, categorie, calitate, imagine)
VALUES ('Televizor Curved LED', 'Depozit Central', 'Televizor LED curbat cu rezoluție 4K și unghi larg de vizualizare', 2200.00, 55, 'LG', '{4K}', 'curved_led_tv.jpg');

INSERT INTO televizoare (nume, locatie_disponibila, descriere, pret, diagonala, categorie, calitate, garantie, imagine)
VALUES ('Televizor Ultra Thin', 'Magazin Online', 'Televizor ultra-subțire cu rezoluție Full HD și design modern', 1400.00, 48, 'Sony', '{HD}', TRUE, 'ultra_thin_tv.jpg');
