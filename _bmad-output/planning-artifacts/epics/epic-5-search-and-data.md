# Epikas 5: Paieškos Tobulinimas ir Duomenų Bazės Papildymas

## Apžvalga

**Pavadinimas:** Paieškos kokybės gerinimas ir pilnos Lietuvos darželių/auklių duomenų bazės sukūrimas
**Tikslas:** 
1. Patobulinti paiešką kad rastų pagal rajonus, adresą, ir netikslius užklausas
2. Papildyti DB su tikrais darželių duomenimis (valstybiniai + privatūs) iš viešų Lietuvos šaltinių
**Bendri istorijos taškai:** 34 SP
**Prioritetas:** Kritinis — duomenų kokybė yra #1 platformos vertė
**BMAD Track:** BMAD Method

---

## Dabartinė Būsena (Problemos)

### Duomenų Bazė
- 304 darželiai (303 valstybiniai, 1 privatus!) — trūksta ~500+ privačių
- Vilniuje tik 63 darželiai — realiai ~200+  
- Rasos rajono nėra, Lazdynų nėra, Karoliniškių nėra — daug rajonų tuščių
- 109 darželių be priskirto rajono (area=null)
- Auklės, būreliai, specialistai — irgi gali būti nepilni

### Paieška
- „darželiai rasos" randa tik darželį kurio PAVADINIME yra „Rasa" (Marijampolės), o ne darželius RASOS rajone
- Paieška neieško adreso lauke efektyviai
- Rajonų sinonimų sistema per siaura
- Trūksta fuzzy matching — „rasose" turėtų rasti „Rasos"

---

## Istorija 1: Rajonų Paieškos Pagerinimas (5 SP)

**Pavadinimas:** Išplėsti rajonų linksniavimą ir paiešką adreso lauke

**Aprašymas:** Pridėti VISUS Vilniaus (ir kitų miestų) rajonų pavadinimus su linksniavimo formomis. Paieška turi ieškoti ne tik area lauke bet ir address lauke. Pridėti fuzzy matching — jei „rasose" nerandama tiksliai, bandyti pirmus 3-4 simbolius.

**Priėmimo kriterijai:**

- **Duota**, kad vartotojas ieško „darželiai rasose",
  **Kai** sistema apdoroja užklausą,
  **Tada** turi rasti visus darželius kurių area='Rasos' ARBA address ILIKE '%Raso%'.

- **Duota**, kad vartotojas ieško „lazdynuose",
  **Kai** sistema normalizuoja raktažodį,
  **Tada** „lazdynuose" turi mapintis į „Lazdynai" ir ieškoti area + address laukuose.

- **Duota**, kad tikslus žodis nerastas (0 rezultatų),
  **Kai** sistema bando fuzzy match,
  **Tada** turi bandyti pirmus 4 simbolius kaip prefix (pvz. „raso" → ILIKE 'Raso%').

---

## Istorija 2: Vilniaus Darželių Duomenų Papildymas (13 SP)

**Pavadinimas:** Surinkti ir įkelti visus Vilniaus savivaldybės darželius (valstybiniai + privatūs)

**Aprašymas:** Iš viešų šaltinių (Vilniaus savivaldybės svetainė, registrai.lt, rekvizitai.lt, Google Maps) surinkti pilną Vilniaus darželių sąrašą su tikrais duomenimis: pavadinimas, adresas, telefonas, tipas (valstybinis/privatus), rajonas, darbo laikas, amžiaus grupės. Dublikatų patikrinimas prieš įkeliant.

**Priėmimo kriterijai:**

- **Duota**, kad dabartinėje DB yra 63 Vilniaus darželiai,
  **Kai** duomenys papildyti,
  **Tada** turi būti ne mažiau nei 150 Vilniaus darželių (valstybiniai + privatūs).

- **Duota**, kad nauji darželiai įkelti,
  **Kai** kiekvienas įrašas patikrinamas,
  **Tada** turi turėti: name, address, city='Vilnius', area (rajonas), type ('valstybinis'/'privatus'), phone (jei randamas).

- **Duota**, kad DB jau turi kai kuriuos darželius,
  **Kai** vykdomas importas,
  **Tada** dublikatai turi būti aptikti (pagal pavadinimą ir adresą) ir praleisti, ne dubliuoti.

---

## Istorija 3: Kitų Miestų Darželių Papildymas (8 SP)

**Pavadinimas:** Papildyti Kauno, Klaipėdos, Šiaulių, Panevėžio darželiais

**Aprašymas:** Analogiškai kaip Vilniui — surinkti trūkstamus darželius iš didžiųjų miestų. Prioritetas: Kaunas (69→150+), Klaipėda (33→80+), Šiauliai, Panevėžys.

**Priėmimo kriterijai:**

- **Duota**, kad importo skriptas sukurtas Vilniui,
  **Kai** jis adaptuojamas kitiems miestams,
  **Tada** kiekvienas miestas turi turėti ne mažiau nei 2x dabartinį kiekį darželių.

- **Duota**, kad visi nauji darželiai turi area lauką,
  **Kai** vartotojas ieško pagal rajoną,
  **Tada** paieška turi rasti darželius tame rajone.

---

## Istorija 4: Area Priskyrimas Esamiems Darželiams (3 SP)

**Pavadinimas:** Priskirti rajonus 109 darželiams kurie neturi area lauko

**Aprašymas:** Pagal adresą (gatvės pavadinimą ir pašto kodą) automatiškai priskirti rajoną esamiems 109 darželiams kurie turi area=null. Naudoti geocoding arba pašto kodų mapą.

**Priėmimo kriterijai:**

- **Duota**, kad 109 darželių neturi area lauko,
  **Kai** skriptas apdoroja kiekvieną pagal adresą,
  **Tada** ne mažiau nei 80% turi gauti teisingą area reikšmę.

---

## Istorija 5: Paieškos Fallback ir Nulinis Rezultatas (5 SP)

**Pavadinimas:** Protingas fallback kai tiksli paieška neranda nieko

**Aprašymas:** Jei tiksli paieška grąžina 0 rezultatų: (1) bandyti prefix match, (2) bandyti ieškoti tik mieste/rajone ir rodyti populiariausius, (3) siūlyti alternatyvas. Pvz: „darželiai rasose" → jei rasos nėra, rodyti „Artimiausi rajonai: Naujininkai (3), Senamiestis (2)".

**Priėmimo kriterijai:**

- **Duota**, kad „darželiai rasose" grąžina 0 rezultatų nes Rasos rajono nėra DB,
  **Kai** sistema vykdo fallback,
  **Tada** turi rodyti „Rasos rajone darželių nerasta. Artimiausi: [kiti Vilniaus rajonai su darželiais]".

- **Duota**, kad vartotojas ieško neegzistuojančio rajono,
  **Kai** 0 rezultatų,
  **Tada** rodyti to paties miesto populiariausius darželius kaip alternatyvą.
