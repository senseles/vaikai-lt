import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ──────────────────────────────────────────────────────────────
// 400+ unique review texts modeled on real Lithuanian parent forums
// (supermama.lt, tevu-darzelis.lt, Google Maps reviews)
// Rating distribution target: 5% ★1, 10% ★2, 20% ★3, 35% ★4, 30% ★5
// ──────────────────────────────────────────────────────────────

const authorNames = {
  female: [
    'Rūta M.', 'Aistė K.', 'Greta P.', 'Simona V.', 'Laura B.', 'Sandra K.',
    'Monika J.', 'Eglė V.', 'Daiva S.', 'Jurgita R.', 'Inga M.', 'Vaida L.',
    'Neringa K.', 'Kristina P.', 'Jolanta K.', 'Rita S.', 'Aušra M.', 'Ieva B.',
    'Agnė D.', 'Dovilė R.', 'Renata P.', 'Dalia P.', 'Inga T.', 'Gintarė B.',
    'Virginija S.', 'Edita M.', 'Asta K.', 'Justina M.', 'Viktorija S.',
    'Milda R.', 'Ramunė S.', 'Kristina L.', 'Dalia A.', 'Sigita R.', 'Rima D.',
    'Lina K.', 'Birutė H.', 'Loreta Ž.', 'Austėja N.', 'Raminta D.',
    'Žydrė O.', 'Nomeda S.', 'Vida R.', 'Gabija F.', 'Indrė S.', 'Gabrielė D.',
    'Milda Č.', 'Austėja R.', 'Sonata L.', 'Vaida T.', 'Lina A.',
    'Jūratė U.', 'Giedrė J.', 'Erika V.', 'Vilma G.', 'Daiva J.',
    'Neringa T.', 'Ieva R.', 'Aistė D.', 'Sigita L.', 'Monika A.',
    'Sandra Č.', 'Dovilė N.', 'Agnė Š.', 'Simona Z.', 'Karolina B.',
    'Beata R.', 'Evelina M.', 'Jurgita P.', 'Viktorija K.', 'Aurelija S.',
    'Diana G.', 'Rasa T.', 'Jolita V.', 'Natalija K.', 'Živilė P.',
    'Edita K.', 'Alma R.', 'Birutė S.', 'Gražina M.', 'Irena L.',
  ],
  male: [
    'Jonas L.', 'Vytautas S.', 'Mindaugas R.', 'Tadas K.', 'Lukas G.',
    'Paulius G.', 'Tomas V.', 'Andrius M.', 'Giedrius T.', 'Artūras B.',
    'Marius L.', 'Andrius L.', 'Darius V.', 'Edvardas P.', 'Matas V.',
    'Domantas J.', 'Paulius A.', 'Edvinas K.', 'Dainius V.', 'Mindaugas P.',
    'Rokas S.', 'Karolis M.', 'Mantas D.', 'Deividas R.', 'Aivaras K.',
    'Tautvydas G.', 'Povilas B.', 'Martynas Š.', 'Evaldas T.', 'Donatas J.',
    'Robertas N.', 'Algirdas V.', 'Gediminas K.', 'Saulius R.', 'Viktoras M.',
  ],
};

const allNames = [...authorNames.female, ...authorNames.male];

// ──────── KINDERGARTEN REVIEWS ────────
const kindergartenReviews: Array<{rating: number; texts: string[]}> = [
  // ★★★★★ (5 stars) — 60 texts
  { rating: 5, texts: [
    'Puikus darželis! Vaikai labai patenkinti, auklėtojos rūpestingos ir profesionalios. Rekomenduoju visiems tėveliams.',
    'Lankome jau antrus metus ir esame labai patenkinti. Maistas sveikas, patalpos švarios, programa įdomi.',
    'Mūsų vaikas pradėjo lankyti prieš pusmetį ir pokytis akivaizdus — kalba geriau, draugauja su kitais vaikais. Ačiū auklėtojoms!',
    'Geriausia mūsų sprendimas buvo rinktis šį darželį. Auklėtoja Rasa tiesiog nuostabi — kantriai dirba su kiekvienu vaiku individualiai.',
    'Kiekvieną dieną kai pasiimam vaiką — vis naujas darbeliai, piešiniai ant šaldytuvo. Vaikai ten tikrai užimti prasmindomis veiklomis.',
    'Mūsų dukra čia lanko jau trečius metus. Auklėtojos tikrai mylintys savo darbą žmonės. Vaikas bėga į darželį su džiaugsmu.',
    'Rekomenduoju visiems tėvams! Vaikas čia lankosi jau antrus metus ir labai patenkintas. Draugai, žaidimai, mokymasis — viskas puiku.',
    'Labai patenkinti šiuo darželiu. Maistas skanus, aplinka švari, vaikai nuolat užsiėmę prasmingom veiklom.',
    'Šis darželis — tikras lobis. Auklėtojos individualiai dirba su kiekvienu vaiku, pastebi jų stipriąsias puses.',
    'Mūsų sūnus pradėjo lankyti būdamas 2.5 m. Adaptacija praėjo sklandžiai, auklėtojos labai padėjo. Dabar eina su džiaugsmu.',
    'Geriausias darželis mieste! Vaikai mokosi per žaidimus, daug laiko praleidžia lauke. Maistas šviežias ir sveikas.',
    'Nuostabus darželis su atsidavusiu kolektyvu. Vaikas grįžta namo laimingas ir pasakoja apie dienos nuotykius.',
    'Esame labai patenkinti. Darželis turi puikią lauko aikštelę, vaikai daug judėjo ir moko naujų dalykų kasdien.',
    'Labai gerai organizuotas ugdymo procesas. Vaikas greitai išmoko skaityti ir skaičiuoti. Auklėtojos profesionalios.',
    'Ačiū šiam darželiui! Mūsų mergaitė čia atrado draugių, pramoko piešti, ir kiekvieną rytą nori eiti.',
    'Vaikai prižiūrimi puikiai. Mano dukra pradėjo lankyti nuo 1.5 m, auklėtojos rado bendrą kalbą labai greitai.',
    'Mes labai ilgai ieškojome gero darželio ir pagaliau radome. Švarumas, tvarka, geras maistas — viskas kaip ir turi būti.',
    'Puikiai organizuotos šventės — Kalėdos, Velykos, gimtadieniai. Vaikai labai džiaugiasi.',
    'Patinka kad auklėtojos reguliariai informuoja apie vaiko dieną. Gauname nuotraukų, žinučių — jaučiamės ramūs.',
    'Mūsų trečias vaikas jau čia lanko — tai sako viską. Patikimas, geras darželis.',
    'Lauko aikštelė puiki, vaikai daug bėgioja ir žaidžia. Mūsų sūnui tai labai svarbu — jis aktyvus.',
    'Vaikas per pusmetį labai pasikeitė — pradėjo kalbėti pilnais sakiniais, tapo drąsesnis. Ačiū auklėtojoms.',
    'Darželis mažas, jauku, kaip namuose. Auklėtojos visus vaikus žino vardu ir pastebi kiekvieną.',
    'Labai patinka Montessori metodika kuria dirba šis darželis. Vaikas mokosi savarankiškumo ir tai matosi namuose.',
    'Po kelių darželių pagaliau radome tinkamą. Čia vaikai gerbiami, su jais kalbama, o ne rėkiama.',
    'Grupėje tik 12 vaikų — tai didelis pliusas. Auklėtoja spėja kiekvienam skirti dėmesio.',
    'Puiki programa su anglų kalbos elementais. Vaikas jau moka skaičiuoti iki 10 angliškai!',
    'Labai geros atsiliepimai iš kitų tėvų ir galiu patvirtinti — darželis tikrai vertas dėmesio.',
    'Auklėtoja Nijolė yra tiesiog pašaukimo žmogus. Vaikai ją dievina.',
    'Nuo pirmos dienos supratome kad pasirinkome teisingai. Vaikas adaptavosi per savaitę.',
    'Mūsų vaikui diagnozuotas kalbos sutrikimas — darželio logopedė labai padeda, matomas didelis progresas.',
    'Maistas ruošiamas vietoje, ne atvežtinis. Jaučiasi skirtumas — vaikas valgo noriai.',
    'Labai patinka kad darželis turi baseiną! Vaikas mokosi plaukti nuo 3 metų.',
    'Darželis dirba iki 18:30 — labai patogu dirbantiems tėvams. Nereikia skubėti.',
    'Vaikas pradėjo lankyti neseniai, bet jau matosi pokytis. Drąsesnis, daugiau kalba, pasakoja apie draugus.',
    'Esame patenkinti pasirinkimu. Auklėtojos labai stengiasi, vaikas nori eiti kiekvieną rytą.',
    'Darželyje didelis dėmesys skiriamas socialiniams įgūdžiams — vaikas išmoko dalintis, laukti eilėje.',
    'Puikios spalvotos patalpos, daug žaislų, gera bibliotekėlė. Vaikas gali rinktis veiklą pats.',
    'Ypatingai džiaugiamės muzikos užsiėmimais — vaikas namuose dainuoja visas darželyje išmoktas dainas.',
    'Mūsų patirtis tik teigiama. Darželis profesionalus, vaikai laimingi, tėvai ramūs.',
    'Labai patinka, kad yra logopedas ir psichologas darželyje. Nereikia ieškoti papildomai.',
    'Lauko teritorija didelė ir saugi. Vaikai gali bėgioti, kopti, suptiesi — viskas apgalvota.',
    'Šis darželis turi gerą reputaciją rajone ir galiu patvirtinti — ne be reikalo.',
    'Vaikui buvo sunku adaptuotis pirmas dvi savaites, bet auklėtojos buvo labai kantrios ir padėjo. Dabar viskas puiku.',
    'Per pandemiją darželis puikiai susiorganizavo — nuotolinės veiklos, darbai namuose. Labai dėkingi.',
    'Mūsų sūnus čia lanko nuo lopšelio grupės. Dabar priešmokyklinukas ir puikiai pasiruošęs mokyklai.',
    'Pavyko gauti vietą per stebuklą — šis darželis labai populiarus. Ir suprantama kodėl!',
    'Auklėtojos pastebėjo kad mūsų vaikui reikia daugiau pagalbos su smulkiąja motorika ir pasiūlė pratimus. Labai dėkingi.',
    'Vaikas jau moka skaityti ir rašyti savo vardą. Dar tik 5 metų! Darželio nuopelnas.',
    'Maistas tikrai geras — vaikas net prašo namie gaminti „kaip darželyje". Virėja šaunuolė.',
    'Šventės darželyje visada šiltos ir jaukios. Jaučiamės kaip šeima.',
    'Auklėtojos kūrybingos — kiekvieną savaitę vis nauji projektai, eksperimentai, stebėjimai.',
    'Mano vaikas bijojo vandens — darželyje per vasaros stovyklą pagaliau išdrįso bristi. Labai dėkinga.',
    'Patogu kad darželis netoli namų, galima ateiti pėsčiomis. Bet svarbiausia — kokybė puiki.',
    'Darželio direktorė visada atvira pokalbiui, išklauso tėvų nuomones. Jaučiamės vertinami.',
    'Mūsų abiejų vaikų auklėtoja ta pati — Auklėtoja Daiva. Abu ją dievina.',
    'Vaikas per metus darželyje tapo visiškai kitoks — iš drovaus, tylaus tapo drąsus ir bendraujantis.',
    'Patinka kad darželis organizuoja išvykas — buvome muziejuje, teatre, gamtoje. Vaikai sužavi.',
    'Labai rekomenduoju šį darželį. Profesionalus kolektyvas, gera aplinka, skanūs pietūs.',
    'Darželis turėtų būti modelis kitiems. Viskas apgalvota — nuo ugdymo programos iki vaiko saugumo.',
  ]},
  // ★★★★ (4 stars) — 60 texts
  { rating: 4, texts: [
    'Gerai organizuotas darželis, bet kartais trūksta komunikacijos su tėvais. Vis dėlto rekomenduočiau.',
    'Vaikai gerai prižiūrimi, tačiau maitinimas galėtų būti geriau. Bendrai vertinu teigiamai.',
    'Auklėtojos labai stengiasi, bet grupėse per daug vaikų. Kitu atžvilgiu — viskas puiku.',
    'Geras darželis, programa subalansuota. Vaikas daug išmoko per trumpą laiką.',
    'Darželis atitinka lūkesčius. Maistas geras, veiklos įdomios. Kartais norėtųsi daugiau lauko laiko.',
    'Geras darželis, vaikai prižiūrimi gerai. Kartais trūksta vietos lauke, bet bendrai patenkinti.',
    'Patinka darželis, bet norėtųsi daugiau kūrybinių veiklų. Auklėtojos geranoriškos.',
    'Bendrai gerai, nors kartais vaikas ateina namo su kitų vaikų drabužiais — sumaišo :)',
    'Darželis geras, tik eilė priimti buvo ilga — laukėme beveik metus.',
    'Auklėtojos profesionalios, vaikas eina noriai. Vienintelis minusas — maistas kartais vienodas.',
    'Patenkinti, nors vieta ne visada lengvai pasiekiama. Bet darželis verto!',
    'Programa gera, bet norėtųsi daugiau informacijos apie vaiko dieną. Kartais nežinome ką veikė.',
    'Vaikas adaptuotis buvo sunku pirmas 3 savaites, bet dabar jau noriai eina. Auklėtojos padėjo.',
    'Geras darželis. Grupėje 18 vaikų — nemažai, bet auklėtoja susitvarkė.',
    'Maitinimas galėtų būti geriau, bet visa kita — labai gerai. Vaikas laimingas.',
    'Patogu kad arti namų. Darželis tvarkingas, auklėtojos malonios.',
    'Gerai, bet pastatas galėtų būti atnaujintas. Viduje jau senas remontas.',
    'Geras darželis su keliomis pastabomis — kartais per vėlai informuoja apie renginius.',
    'Vaikai mokomi gerų manierų ir savarankiškumo. Tai matosi namuose. Patenkinti.',
    'Auklėtoja gera, bet padėjėja kartais gruboka su vaikais. Tikiuosi pagerės.',
    'Darželis gerai organizuotas, bet norėtųsi ilgesnio darbo laiko — iki 18:00 per mažai.',
    'Maistas sveikas, bet vaikas sako „neskanu". Suprantu kad sunku visiems įtikti.',
    'Geras darželis, tik automobilių stovėjimas probleminis — ryte visada kamštis.',
    'Auklėtojos geros, bet vaikas dažnai serga. Manau per daug vaikų grupėje.',
    'Gerai, nors adaptacijos periodas buvo sunkus. Po mėnesio viskas normalizavosi.',
    'Piešimo ir muzikos užsiėmimai labai patinka vaikui. Kūno kultūra galėtų būti dažniau.',
    'Patinka kad darželis organizuoja šventės, bet tėvų susirinkimai galėtų būti dažniau.',
    'Vaikas eina noriai, turi draugų. Maistas vidutiniškas, bet ne tai svarbiausia.',
    'Darželis neblogas. Yra ką tobulinti, bet pagrindinai esame patenkinti.',
    'Auklėtojos rūpestingos, bet kartais vaikas parneša namo subraižytą — vaikiškos peštynės.',
    'Darželis patogus, su geru kiemu. Tik šiek tiek sena įranga viduje.',
    'Programa nėra bloga, bet galėtų būti daugiau gamtos pažinimo veiklų.',
    'Bendrai gerai. Vaikas lanko 2 metus, esame patenkinti. Kartais būna smulkių nesklandumų.',
    'Darželis geras, auklėtojos stengiasi. Bet kai kas nors susirgsta — po savaitės visa grupė serga.',
    'Geras pasirinkimas, ypač dėl lokacijos ir kainų. Ugdymo kokybė — virš vidurkio.',
    'Patenkinti darželiu. Vaikas daug ko išmoko — spalvas, raides, skaičius. Ačiū auklėtojoms.',
    'Darželis gerai organizuotas, bet maitinimo meniu galėtų būti įvairesnis.',
    'Auklėtojos puikios, bet administracija kartais lėtai reaguoja į užklausas.',
    'Vaikas labai patenkintas, auklėtoja maloni. Norėtųsi tik daugiau informacijos apie ugdymo planą.',
    'Geras darželis su kompetentingu personalu. Trūksta tik modernesnių žaislų/priemonių.',
    'Vis dėlto rekomenduočiau. Mūsų patirtis daugiausiai teigiama, nors yra ką tobulinti.',
    'Darželis tvarkingas ir saugus. Auklėtojos rūpestingos. Trūksta tik anglų k. užsiėmimų.',
    'Mano vaikas ten laimingas, o tai svarbiausia. Yra smulkių minusų, bet jie neesminiai.',
    'Vaikas patenkintas draugais ir auklėtojomis. Maitinimas — vidutiniškas, bet valgomas.',
    'Geras darželis, nors kartais trūksta komunikacijos. Rekomenduočiau bet su išlygomis.',
    'Auklėtojos šaunuolės, bet pastatas senas ir reikėtų remonto. Viduje jauku, bet lauke — ne.',
    'Darželis atitinka mūsų lūkesčius. Ne idealus, bet geras.',
    'Patinka lauko veiklos ir ekskursijos. Viduje galėtų būti daugiau vietos žaidimams.',
    'Geras darželis, ypač vertinu auklėtojų pastangas. Administracija galėtų būti draugiškesnė.',
    'Mūsų vaikas čia lanko pusmetį. Gerai, nors vis dar adaptuojasi. Auklėtojos kantriai padeda.',
    'Darželis su gera lokacija ir profesionaliu personalu. Maistas — plius-minus, priklausomai nuo dienos.',
    'Vaikai gerai užimti per dieną, ateina namo pavargę ir laimingi.',
    'Geras darželis. Maitinimas galėtų būti šiltesnis — vaikas sako kartais pietūs jau atvėsę.',
    'Auklėtojos malšina konfliktus profesionaliai — tai svarbu. Geras darželis.',
    'Ne idealus, bet tikrai virš vidurkio. Rekomenduočiau kaimynams.',
    'Vaikas eina su malonumu, tik kartais skundžiasi kad „per daug triukšmo".',
    'Darželis gerai veikiantis, su stabilia komanda. Tai svarbu — nuolatinė auklėtoja, ne nuolat besikeičiančios.',
    'Patenkinti. Vaikas daug ko išmoko, nors kartais norėtų daugiau lauko laiko.',
    'Geras darželis, gera kaina. Auklėtojos rūpestingos, programa subalansuota.',
    'Mūsų patirtis teigiama. Keletas smulkių pastabų dėl komunikacijos, bet bendrai — gerai.',
  ]},
  // ★★★ (3 stars) — 50 texts
  { rating: 3, texts: [
    'Darželis vidutiniškas. Yra ir pliusų, ir minusų. Vieta patogi, bet pastatas senas ir reikalauja remonto.',
    'Auklėtojos malonios, bet programa galėtų būti įdomesnė. Vaikas nenorai eina, bet draugai patinka.',
    'Normalu, bet tikėjomės daugiau. Gal tiesiog ne mūsų stilius.',
    'Nieko ypatingo, bet ir nieko blogo. Standartinis darželis.',
    'Tris žvaigždutes, nes darželis senokas ir reikia remonto. Bet personalas stengiasi.',
    'Vidutiniškai. Maistas kartais geresnis, kartais prastesnis. Auklėtojos normalios.',
    'Darželis normalus, bet per daug vaikų grupėje — 24! Individualaus dėmesio trūksta.',
    'Girdėjome gerų atsiliepimų, bet mūsų patirtis vidutiniška. Gal tiesiog gavome ne tą grupę.',
    'Pastatas atnaujintas, bet programa sena. Vaikai daugiausia tiesiog žaidžia, mažai ugdymo.',
    'Vaikui patinka draugai, bet auklėtoja nelabai skiria dėmesio individualiems poreikiams.',
    'Maitinimas vidutiniškas. Vaikas dažnai sako „neskanu" ir grįžta alkanas.',
    'Darželis neblogas, bet tikrai ne geriausias rajone. Yra ir geresnių variantų.',
    'Adaptacija buvo sunki — tuko 3 savaites. Auklėtojos galėjo labiau padėti.',
    'Normalu. Vaikas eina, draugai yra, bet nieko ypatingo neišmoksta.',
    'Darželis tvarkingas, bet programa monotoniška. Kasdien beveik tas pats.',
    'Lauko aikštelė maža ir sena. Viduje geriau, bet galėtų būti ir daugiau žaislų.',
    'Vidutiniškas vertinimas. Auklėtojos stengiasi, bet matosi kad pervargusios.',
    'Per daug biurokratijos — kiekvienam dalykui reikia rašyti prašymą.',
    'Maistas atvežtinis — nelabai skanus. Tai didžiausias minusas.',
    'Vaikas sirgo kas antrą savaitę pirmus 3 mėnesius. Manau higienos galėtų būti daugiau.',
    'Girdėjome ir gerų ir blogų atsiliepimų. Mūsų patirtis kažkur per vidurį.',
    'Auklėtoja keičiasi kas pusmetį — vaikui sunku prisitaikyti prie naujų žmonių.',
    'Darželis neseniai atnaujintas, bet programa liko sena. Reikėtų modernizuoti ugdymą.',
    'Lokacija patogi, bet tai vienintelis didelis pliusas. Visa kita — vidutiniška.',
    'Vaikui kartais patinka, kartais ne. Priklauso nuo dienos ir auklėtojos nuotaikos.',
    'Sena įranga, bet auklėtojos šiltos. Tai kompensuoja dalį trūkumų.',
    'Darželis geresnis nei tikėjomės pagal kainą, bet vis tiek — tik vidutiniškas.',
    'Per daug vaikų, per mažai auklėtojų. Personalas pervargęs — ir tai matosi.',
    'Maitinimas OK, ugdymas OK, bet trūksta šilumos. Jaučiasi „konvejeris".',
    'Vaikui patinka sporto salė, bet kiti užsiėmimai jam neįdomūs.',
    'Buvo geriau kai pradėjome lankyti, dabar kokybė krito. Gal dėl personalo kaitos.',
    'Darželis normalus miesto darželis. Nei blogas, nei ypatingas.',
    'Vaikas turi draugų ir tai pagrindinė priežastis kodėl dar lankome. Ugdymas vidutiniškas.',
    'Kartais skambinu paklausti kaip vaikas — ne visada pavyksta prisiskambinti.',
    'Darželis OK. Nėra ko labai girti ar labai peikti.',
    'Pastatas naujas, bet auklėtojos ne visos kompetentingos. Viena labai gera, kita — abejoju.',
    'Maitinimas galėtų būti geriau — per daug sausainių ir mažai daržovių.',
    'Vaikas lanko, nes nėra kito varianto šalia namų. Ieškosime geresnio.',
    'Auklėtojos geranoriškos, bet patirties trūksta. Jaučiasi kad dar mokosi.',
    'Vidutiniškas darželis. Nei rekomenduočiau, nei atkalbinėčiau.',
    'Vaikas eina be ašarų — tai gerai. Bet ir be entuziazmo — tai blogai.',
    'Darželis ne blogas, bet komunikacija su tėvais minimali. Nežinome ką vaikas veikia per dieną.',
    'Skaičiavimo ir skaitymo moko, bet kūrybinių veiklų beveik nėra.',
    'Per mažai laiko lauke. Vaikai per daug laiko praleidžia viduje.',
    'Darželis vidutinis, bet auklėtoja mūsų grupėje — labai gera. Dėl jos ir lankome.',
    'Pirma savaitė buvo košmaras — vaikas verkė, auklėtojos tik gūžčiojo pečiais. Dabar geriau.',
    'Ne tai ko tikėjomės už tokią kainą. Privatus darželis turėtų siūlyti daugiau.',
    'Normalus darželis, bet yra geresnių variantų. Jei turite galimybę rinktis — ieškokite.',
    'Vaikai myli auklėtojas, bet maitinimas tikrai reikalauja pagerinti.',
    'Kaina atitinka kokybę — nei per brangu, nei per pigu. Vidutiniškai.',
  ]},
  // ★★ (2 stars) — 25 texts
  { rating: 2, texts: [
    'Deja, lūkesčiai nebuvo patenkinti. Grupėje per daug vaikų, o auklėtojos nuolat keičiasi.',
    'Per daug vaikų vienoje grupėje. Individualus dėmesys minimalus.',
    'Maistas šaltas ir neskanus — vaikas nuolat alkanas grįžta namo.',
    'Auklėtojos ignoruoja tėvų pastabas. Bandžiau kalbėtis — be rezultato.',
    'Vaikas parėjo namo su mėlyne ant rankos. Auklėtoja sakė „vaikai žaidė". Nerimą kelia.',
    'Pastatas apleistas, lauko aikštelė nesaugi — suplyšę gumos dangos. Nenorėjau rizikuoti.',
    'Vaikas verkė kiekvieną rytą 2 mėnesius. Auklėtojos nesistengė padėti adaptuotis.',
    'Komunikacijos nulis. Nežinome ką vaikas veikia visą dieną.',
    'Per brangu už tai ką gauni. Privatus darželis su viešo lygio paslauga.',
    'Susirgimas po susirgimo. Vaikas per 3 mėnesius lankė gal 4 savaites.',
    'Auklėtoja rėkia ant vaikų. Vaikas pradėjo bijoti eiti į darželį.',
    'Darželis nepriima alergikų maisto — mūsų vaikui su alergija buvo neįmanoma.',
    'Eilė registracijai absurdiškai ilga — 1.5 metų! O kai pagaliau patekome — nusivylėme.',
    'Vaikas subraižytas, o auklėtoja nežino kas nutiko. Priežiūra abejotina.',
    'Darželis purvinas. Tualetai seni, prausyklos surūdiję.',
    'Programa visiškai neįdomi — vaikai tiesiog sėdi ir žiūri multikus.',
    'Auklėtoja pati su telefonu sėdi, vaikai patys sau. Mačiau savo akimis.',
    'Maitinimas monotoniškas — kas antrą dieną makaronai su mėsa.',
    'Vaikas pradėjo elgtis agresyviai namuose — manau perėmė iš darželio aplinkos.',
    'Nusivylėme. Daug gerų atsiliepimų internete, bet realybė visai kitokia.',
    'Auklėtojos keičiasi nuolat — vaikas nespėja priprasti prie vienos, jau kita.',
    'Darželis neskiria dėmesio vaikams su specialiais poreikiais.',
    'Per daug „ekranų laiko" — vaikai žiūri filmukus kai auklėtojoms reikia pertraukos.',
    'Lauko aikštelėje vaikas susilaužė ranką — nesaugi įranga. Bylinėsimės.',
    'Negaliu rekomenduoti. Mūsų patirtis buvo bloga nuo pradžios iki galo.',
  ]},
  // ★ (1 star) — 15 texts
  { rating: 1, texts: [
    'Baisiausia patirtis. Vaikas grįžo namo šlapias, alkanas ir verkiantis. Daugiau nebeleidome.',
    'Apleistas darželis be jokio ugdymo. Vaikai tiesiog uždaryti patalpoje visai dienai.',
    'Auklėtoja šaukė ant mano 3 metų vaiko! Visiškai nepriimtina. Išrašėme tą pačią dieną.',
    'Darželis turėtų būti uždarytas. Nehigieniškos sąlygos, maistas abejotinas.',
    'Per 2 savaites vaikas peršalo 3 kartus. Patalpos šaltos, langai nesandarus.',
    'Siaubinga patirtis. Vaikas pradėjo šlapintis lovoje po pirmo mėnesio darželyje.',
    'Auklėtojos visiškai abejingos vaikams. Matėme kaip vaikai verkia, o jos kalbasi tarpusavy.',
    'Darželis reklamuojasi kaip „premium", bet realybė — kaip seniausi sovietiniai darželiai.',
    'Mano vaikas buvo paliktas lauke vienas — auklėtoja „nepamatė". Daugiau nebegrįšime.',
    'Vaikas atsisakė valgyti darželio maistą — sakė „smirda". Patikrinome — maistas tikrai abejotinos kokybės.',
    'Visiškas nusivylimas. Jokios programos, jokio ugdymo. Vaikai tiesiog sėdi.',
    'Auklėtoja padarė vaikui skriaudą — rankos buvo paraudonavusios. Kreipėmės į policiją.',
    'Darželis perpildytas. 28 vaikai grupėje su viena auklėtoja. Tai ne darželis, tai sandėlis.',
    'Vaikas pradėjo bijoti suaugusiųjų po šio darželio. Lankėmės pas psichologą.',
    'Nerekomenduoju niekam. Prarastas laikas ir pinigai. Vaikas traumuotas.',
  ]},
];

// ──────── AUKLĖ (NANNY) REVIEWS ────────
const aukleReviews: Array<{rating: number; texts: string[]}> = [
  { rating: 5, texts: [
    'Nuostabi auklė! Vaikai ją myli. Labai atsakinga, punktuali ir kūrybinga. Užsiėmimai visada įdomūs.',
    'Profesionali, šilta ir rūpestinga. Vaikas visada laimingai laukia jos atėjimo.',
    'Geriausia auklė, kokią teko turėti. Labai rekomenduoju!',
    'Auklė randa bendrą kalbą su vaikais ir moka juos užimti prasmingai.',
    'Radome per pažįstamus ir labai džiaugiamės. Auklė puikiai sutaria su mūsų dviem vaikais.',
    'Auklė ateina su paruoštomis veiklomis — piešimas, lipdinys, žaidimai. Vaikas jos laukia!',
    'Su ja mūsų vaikas pramoko anglų kalbos žodžių. Labai kūrybinga ir protinga moteris.',
    'Patikima 100%. Per 2 metus nė karto nepavėlavo ir nė karto neapvylė.',
    'Auklė maloni, švelni, bet kartu ir struktūruota. Vaikas turi tvarkaraštį ir tai padeda.',
    'Mūsų auklė — kaip šeimos narė. Vaikas ją vadina „teta" ir labai myli.',
    'Labai profesionali auklė su pedagoginiu išsilavinimu. Matosi patirtis.',
    'Auklė surado būdą kaip mūsų nedrąsų vaiką „atrakinti". Dabar jis drąsus ir kalbus.',
    'Ateina net kai serga — tikra profesionalė. Labai dėkingi.',
    'Su mūsų auklė galime ramiai dirbti — žinome kad vaikas geriausiose rankose.',
    'Auklė ne tik prižiūri, bet ir ugdo. Vaikas per metus labai pasikeitė.',
    'Rekomenduoju be jokių abejonių. Geriausia investicija į vaiko gerovę.',
    'Auklė turi pirmosios pagalbos sertifikatą — tai buvo svarbus kriterijus mums.',
    'Jauki, šilta, kantri. Tiksliai tokia auklė kokios ieškojome.',
    'Per metus su šia aukle vaikas pradėjo kalbėti pilnais sakiniais. Nuostabu!',
    'Auklė puikiai tvarkosi ir su kūdikiu, ir su vyresniu vaiku vienu metu.',
    'Labai lanksti — galime keisti laikus ir ji visada prisitaiko.',
    'Auklė viską dokumentuoja — siunčia nuotraukas, rašo ką veikė. Jaučiamės ramūs.',
    'Mūsų šuo ją myli, vaikai ją myli — ko daugiau reikia? :)',
    'Auklė atrado kad vaikas turi klausos problemų — mes to nepastebėjome. Labai dėkingi.',
    'Puiki auklė su ilgamete patirtimi. Jaučiasi kad tai — jos pašaukimas.',
  ]},
  { rating: 4, texts: [
    'Labai gera auklė, patikima ir maloni. Vienintelis minusas — ne visada galima suderinti laikus.',
    'Mūsų vaikui labai patinka su ja. Šiek tiek brangoka, bet kokybė verta kainos.',
    'Atsakinga ir patikima. Vaikai ją labai mėgsta.',
    'Gera auklė, bendravimas sklandus. Rekomenduoju.',
    'Auklė gera, bet kartais per daug leidžia vaikui žiūrėti TV. Kalbėjomės — situacija pagerėjo.',
    'Profesionali, bet kaina aukšta. Vis dėlto verta — vaikas patenkintas.',
    'Gera auklė, tik kartais sunku susitarti dėl grafiko — ji labai užimta.',
    'Auklė patikima ir maloni. Vaikas ją mėgsta, nors pirmas dvi dienas verkė.',
    'Su ja vaikas jaučiasi saugiai. Kartais norėtųsi daugiau kūrybinių veiklų.',
    'Gera auklė, bet ne visada laikosi susitarimo dėl maitinimo — kartais duoda saldumynų.',
    'Patikima ir rūpestinga. Trūksta tik pedagoginio pasiruošimo — ne visada žino kaip reaguoti.',
    'Auklė šauni, vaikas ją mėgsta. Gal tik šiek tiek per didelė kaina, bet kokybė gera.',
    'Labai gera auklė namuose. Vienintelis minusas — retai veda vaiką į lauką.',
    'Profesionali ir maloni. Kiek trūksta iniciatyvos — reikia pasakyti ką daryti.',
    'Gera auklė, nors vaikas pradžioje nenorėjo jos priimti. Po savaitės viskas buvo gerai.',
    'Auklė patikima ir punktuali. Norėtųsi tik daugiau veiklų su vaiku.',
    'Rekomenduočiau. Gera, patikima, su vaikais moka elgtis. Kaina priimtina.',
    'Auklė gera, bet kartais per anksti nori išeiti. Sutarta iki 18:00, bet 17:30 jau rengiasi.',
    'Mūsų vaikui patinka su ja, tai svarbiausia. Kaina galėtų būti mažesnė, bet suprantu.',
    'Gera auklė, tik kartais pamiršta vaistus duoti laiku. Kalbėjomės, tikiuosi pasitaisys.',
  ]},
  { rating: 3, texts: [
    'Auklė šiaip gera, bet ne visuomet laikosi susitarimo dėl laikų.',
    'Vidutiniškai. Nieko blogo, bet ir nieko ypatingo.',
    'Normalu. Vaikui patinka, bet norėtųsi daugiau veiklų.',
    'Auklė maloni, bet be iniciatyvos. Reikia viską pasakyti ką daryti su vaiku.',
    'Vaikas prižiūrimas, bet ugdymo jokio. Tiesiog „pabūna" kartu.',
    'Kartais pavėluoja 15-20 min. Kai dirbam — tai labai nepatogu.',
    'Auklė normalė, bet su vyresniu vaiku nesusikalba. Su jaunesniu — gerai.',
    'Kaina per didelė už tai ką gauname. Tik priežiūra, jokio ugdymo.',
    'Auklė patikima, bet bendravimas su ja šaltokas. Norėtųsi šiltesnio kontakto.',
    'Vaikas nei džiaugiasi nei verkia kai auklė ateina. Turbūt normalu.',
    'Auklė OK, bet tikėjomės daugiau patirties. Jaučiasi kad dar mokosi.',
    'Vidutiniškas vertinimas. Auklė pakankamai gera, bet ne puiki.',
    'Mūsų auklė geresnė nei prieš tai buvusi, bet vis tiek — ne ideali.',
    'Auklė gera su kūdikiu, bet su 4-mečiu nebesusitvarko. Reikėtų daugiau patirties.',
    'Normali auklė. Vaikas prižiūrimas, pamaitintas, bet jokių papildomų veiklų.',
  ]},
  { rating: 2, texts: [
    'Nepavyko rasti bendros kalbos. Auklė buvo nepatikima dėl laiko.',
    'Auklė per daug laiko praleidžia telefone. Pamačiau per kamerą.',
    'Vaikus maitino nesveikatai — saldainiai, traškučiai. Nesilaikė mūsų taisyklių.',
    'Auklė atšaukė paskutinę minutę 3 kartus per mėnesį. Nepatikima.',
    'Vaikas pradėjo bijoti auklės — nežinome priežasties, bet nusprendėme nutraukti.',
    'Per brangu. 12€/val. o vaikas tiesiog žiūri TV visą dieną.',
    'Auklė pasirodė be patirties nors sakė turinti. Su kūdikiu nesusitvarkė.',
    'Negali pasikliauti — vėluoja, atšaukia, „pamiršta". Teko ieškoti kitos.',
    'Auklė nemoka lietuviškai — susikalbėjimas su vaiku buvo probleminis.',
    'Nusivylėme. Auklė buvo rekomenduota, bet realybė — labai skirtinga.',
  ]},
  { rating: 1, texts: [
    'Auklė paliko vaiką vieną kambaryje ir nuėjo rūkyti į balkoną. Atleista vietoje.',
    'Radome vaiką verkiantį ir šlapią kai grįžome namo. Auklė žiūrėjo TV.',
    'Auklė vogė maistą iš šaldytuvo ir naudojo mūsų daiktus. Nebegrįžo.',
    'Vaikas turėjo mėlynes ant rankų. Auklė nepaaiškino. Kreipėmės į policiją.',
    'Blogiausias sprendimas buvo samdyti šią auklę. Vaikas traumuotas.',
  ]},
];

// ──────── BŪRELIS (CLUB/ACTIVITY) REVIEWS ────────
const burelisReviews: Array<{rating: number; texts: string[]}> = [
  { rating: 5, texts: [
    'Puikus būrelis! Vaikas per mėnesį išmoko daugiau nei tikėjomės. Vadovė labai kompetentinga.',
    'Lankome robotikos būrelį ir vaikas tiesiog susižavėjęs. Kiekvieną savaitę laukia su nekantrumu.',
    'Šokių būrelis — mūsų geriausia investicija. Vaikas tapo drąsesnis, lankstesnis ir laimingesnis.',
    'Meno būrelis tiesiog nuostabus. Vadovė labai kūrybinga ir kantriai dirba su vaikais.',
    'Labai geras būrelis, vaikas daug ko išmoko. Rekomenduoju!',
    'Plaukimo būrelis — vaikas per 3 mėnesius išmoko plaukti! Treneris puikus.',
    'Programavimo būrelis 8-mečiui — idealus. Vaikas namuose jau kuria savo žaidimus.',
    'Teatro būrelis padėjo vaikui atsikratyti drovumo. Dabar drąsiai kalba prieš klasę.',
    'Karatė būrelis — vaikas tapo disciplinuotesnis ir drąsesnis. Sensei puikus.',
    'Dailės studija nuostabi! Vaikas piešia kiekvieną dieną namuose. Mokytoja įkvepianti.',
    'Šachmatų būrelis ugdo mąstymą — vaikas pradėjo geriau mokytis ir matematikoje.',
    'Muzikos būrelis — dukra išmoko groti pianinu per metus! Labai talentinga mokytoja.',
    'Futbolo treniruotės — sūnus tapo komandinis žaidėjas, susitvarko su pralaimėjimais. Puiku!',
    'Keramikos būrelis — labai raminanti veikla vaikui. Grįžta namo ramus ir patenkintas.',
    'Anglų kalbos būrelis per žaidimus — vaikas net nepajuto kad mokosi. Super!',
    'Gamtos pažinimo būrelis — vaikas dabar žino visus miško paukščius. Nuostabu!',
    'Gimnastikos būrelis — dukra tapo lanksčiausia klasėje. Trenerė profesionalė.',
    'Kulinarijos būrelis vaikams — sūnus dabar padeda gaminti namuose! Labai smagu.',
    'Lego robotikos būrelis — vaikas susižavėjo inžinerija. Gal būsimas inžinierius!',
    'Šokių studija — dukra dalyvavo pasirodyme ir buvo laimingiausia pasaulyje. Ačiū!',
    'Jojimo būrelis — vaikas atrado meilę gyvūnams ir drąsą. Tikrai verta!',
    'IT būrelis — sūnus sukūrė savo pirmą svetainę per mėnesį. Mokytojas šaunuolis.',
    'Vaikas nekantriai laukia kiekvieno užsiėmimo. Tai geriausia kokią veiklą jam pasirinkome.',
    'Būrelis suteikia vaikui tai ko trūksta mokykloje — kūrybiškumą ir laisvę.',
    'Vadovė ne tik moko, bet ir įkvepia. Vaikas nori būti „kaip ji" kai užaugs.',
  ]},
  { rating: 4, texts: [
    'Gerai organizuotas būrelis, vaikai gauna daug naujos informacijos. Gal tik per trumpa pamoka.',
    'Meno būrelis labai patinka. Darbai puikūs, bet grupėje galėtų būti mažiau vaikų.',
    'Geras būrelis, tik kaina galėtų būti draugiškesnė.',
    'Vaikai patenkinti, programa įdomi ir struktūruota.',
    'Geras būrelis, tik vieta sunkiai pasiekiama — nėra parkingo šalia.',
    'Vadovė profesionali, bet kartais pamokos per trumpos — vaikas nesuspėja užbaigti darbo.',
    'Būrelis patinka, nors kartais vadovas pakeičia planą paskutinę minutę.',
    'Geras būrelis su geru treneriu. Tik per diddelė grupė — 15 vaikų per daug.',
    'Vaikas daug ko išmoko per pusmetį. Gal tik norėtųsi daugiau praktikos ir mažiau teorijos.',
    'Būrelis vertas kainos. Tik norėtųsi kad būtų dažniau — 2x per savaitę būtų idealiai.',
    'Vadovė šauni, bet patalpos galėtų būti geriau pritaikytos. Ankšta.',
    'Geras būrelis, tik kartais užsiėmimai atšaukiami dėl vadovo ligos. Suprantama, bet nepatogu.',
    'Vaikas patenkintas, tai svarbiausia. Gal tik šiek tiek per brangu.',
    'Programa įdomi, bet kartais per sudėtinga 5-mečiui. Galėtų būti pritaikyta amžiui.',
    'Patinka būrelis, nors komunikacija su tėvais galėtų būti geresnė.',
    'Geras būrelis, tik norėtųsi daugiau atviru durų dienų kad tėvai galėtų stebėti.',
    'Vaikas eina su malonumu. Kaina priimtina, kokybė gera.',
    'Būrelis patinka, bet kartais šiek tiek chaotiškas. Reikėtų aiškesnės struktūros.',
    'Geras treneris, vaikai jį gerbia. Trūksta tik modernesnės įrangos.',
    'Rekomenduočiau. Geras būrelis su keliais smulkiais trūkumais.',
  ]},
  { rating: 3, texts: [
    'Būrelis neblogas, bet tikėjausi daugiau. Vadovė maloni, tačiau programa galėtų būti struktūruotesnė.',
    'Vidutiniškas. Vaikui nelabai patiko, bet gal tiesiog ne jo sritis.',
    'Norėtųsi geresnės organizacijos ir komunikacijos su tėvais.',
    'Vaikas lanko, nes draugai lanko. Pačiam būreliui — tik vidutiniškas įvertinimas.',
    'Per daug vaikų grupėje, vadovas nesuspėja visiems skirti dėmesio.',
    'Kaina neatitinka kokybės. Tikėjomės daugiau už 40€/mėn.',
    'Patalpos senos ir nejauku. Programa nieko ypatingo.',
    'Vadovė maloni, bet neturi aiškaus plano. Kiekviena pamoka — improvizacija.',
    'Vaikui pirmas mėnuo patiko, po to — nuobodulys. Programa kartojasi.',
    'Vidutiniškas būrelis. Nei blogai, nei gerai.',
    'Treneris geras, bet patalpos per mažos tokiam vaikų skaičiui.',
    'Būrelis OK, bet tikėjomės didesnio progreso per pusmetį.',
    'Užsiėmimai kartais atšaukiami be paaiškinimo. Frustruojantis.',
    'Normalu. Vaikas neverkia, bet ir nenori bėgti ten. Kol kas tęsiame.',
    'Būrelis galėtų būti geresnis. Vadovui trūksta entuziazmo.',
  ]},
  { rating: 2, texts: [
    'Nusivylėme. Programa neįdomi, vaikas nenorėjo tęsti.',
    'Vadovas nemandagus su vaikais — rėkia kai nesigauna. Tai ne mokymas.',
    'Per brangu už tai ką gauni. 50€/mėn. o vaikas ateina namo be jokių žinių.',
    'Chaosas. Nėra struktūros, vaikai bėgioja ir daro ką nori.',
    'Grupėje 20 vaikų ir vienas vadovas. Tai ne būrelis, tai auklėjimo kambarys.',
    'Vaikas po pirmo mėnesio atsisakė eiti. Sakė „neįdomu ir baisu".',
    'Patalpos purvinos, WC sugedęs, šaltis. Nemalonės sąlygos.',
    'Vadovė per daug reikli 4-mečiams. Vaikas pradėjo bijoti klaidų.',
    'Pažadėjo individualų požiūrį — gavome konvejerį. Nusivylėme.',
    'Vaikas po būrelio grįžta piktas ir pavargęs. Ne ta veikla.',
  ]},
  { rating: 1, texts: [
    'Siaubinga patirtis. Vadovas ignoravo vaikus ir žiūrėjo telefoną.',
    'Būrelis neegzistuoja — tai tiesiog kambarys kur vaikai palikti vieni.',
    'Vaikas susižeidė per užsiėmimą, nes nebuvo prižiūrimas. Daugiau neiname.',
    'Pinigų švaistymas. Jokio ugdymo, jokios programos, jokio dėmesio.',
    'Vadovas buvo girtas per užsiėmimą. Taip, rimtai. Pranešėme policijai.',
  ]},
];

// ──────── SPECIALIST REVIEWS ────────
const specialistReviews: Array<{rating: number; texts: string[]}> = [
  { rating: 5, texts: [
    'Logopedė tiesiog nuostabi! Per 3 mėnesius vaikas pradėjo taisyklingai tarti visus garsus. Labai rekomenduoju.',
    'Psichologė padėjo mūsų vaikui įveikti baimę eiti į darželį. Profesionali ir labai maloni.',
    'Kineziterapeutė rado problemą, kurios kiti specialistai nepastebėjo. Labai dėkinga už jos pagalbą.',
    'Puikus specialistas, rezultatai akivaizdūs. Labai rekomenduoju.',
    'Profesionalus ir šiltas požiūris. Vaikas nebijojo eiti į vizitus.',
    'Logopedė kantriai ir nuosekliai dirba su mūsų sūnumi. Per pusmetį — didžiulis progresas!',
    'Ergoterapeutė padėjo vaikui su rašymu ir smulkiosios motorikos problemomis. Ačiū!',
    'Vaikų psichologė sugebėjo per 2 sesijas suprasti kas vargina mūsų vaiką. Profesionalė!',
    'Specialistė dirba su vaiku žaidimų forma — jis net nesupranta kad mokosi. Nuostabu!',
    'Logopedė „R" garsą ištaisė per 2 mėnesius. Manėme kad užtruks ilgiau. Super!',
    'Psichologė padėjo mums kaip šeimai suprasti vaiko elgesį. Labai vertingas pokalbis.',
    'Kineziterapeutė profesionali ir maloni. Vaikas su plokščiomis pėdomis — jau matosi progresas.',
    'Specialistė labai gerai dirba su autizmo spektro vaikais. Mūsų sūnus padaro didelę pažangą.',
    'Logopedė moko per žaidimus, daineles, korteles. Vaikui patinka „žaisti" su ja.',
    'Puiki specialistė! Vaikas turėjo mikčiojimo problemą — dabar beveik praėjo.',
    'Ergoterapeutė labai profesionali. Padeda vaikui adaptuotis mokykloje.',
    'Specialistė randa individualų požiūrį į kiekvieną vaiką. Tai reta ir vertinga.',
    'Logopedė ne tik taiso tartį, bet ir ugdo kalbą kompleksiškai. Rekomenduoju.',
    'Psichologės konsultacija buvo labai naudinga — pagaliau supratome kodėl vaikas agresyvus.',
    'Kineziterapeutė padeda vaikui po traumos. Per mėnesį — didelė pažanga. Dėkingi.',
    'Specialistė turi „auksinę kantrybę". Su mūsų hiperaktyviu vaiku — tai būtina.',
    'Logopedė dirba ir su mumis tėvais — moko kaip padėti vaikui namuose. Labai svarbu!',
    'Puiki vaikų ortodontė — vaikas nebijojo ir bendradarbiavo. Rekomenduoju.',
    'Specialistė padėjo vaikui su disleksija — dabar skaito daug geriau. Ačiū!',
    'Psichologė labai šilta ir profesionali. Vaikas po vizitų tampa ramesnis.',
  ]},
  { rating: 4, texts: [
    'Geras specialistas, padėjo su kalbos problemomis. Tik eilėje reikėjo palaukti ilgiau nei norėtųsi.',
    'Ergoterapeutė labai kompetentinga. Rezultatai matomi, nors progresas lėtas (kas normalu).',
    'Profesionali konsultacija, aiškiai paaiškino situaciją ir planą.',
    'Geras specialistas, bet kaina aukšta. Vis dėlto verta.',
    'Logopedė gera, bet užsiėmimai per trumpi — 30 min. nepakanka.',
    'Psichologė profesionali, tik laukimas eilėje — 2 mėnesiai. Bet verta laukti.',
    'Specialistas kompetentingas. Norėtųsi tik šiek tiek ilgesnių sesijų.',
    'Geras specialistas, aiškiai komunikuoja planą ir progresą. Tik kaina aukšta.',
    'Logopedė patinka vaikui — tai svarbiausia. Progresas yra, nors lėtas.',
    'Ergoterapeutė profesionali ir maloni. Tik patalpos galėtų būti jaukesnės.',
    'Specialistė gera, bet kartais atšaukia vizitus. Suprantama, bet nepatogu.',
    'Psichologė padėjo suprasti vaiko elgesį. Reikėtų tik daugiau praktinių patarimų.',
    'Gera logopedė, tik kartais sunku gauti terminą — labai užimta.',
    'Kineziterapeutė puiki, bet nėra vakaro laikų. Dirbančiai šeimai nepatogu.',
    'Specialistas profesionalus, rezultatai matomi. Kaina aukšta, bet suprantama.',
    'Vaikui patinka vizitai — tai jau didelis pliusas. Progresas — laiko klausimas.',
    'Geras specialistas, rekomenduočiau. Keli smulkūs trūkumai — ilga eilė ir aukšta kaina.',
    'Logopedė dirba gerai, bet norėtųsi daugiau namų darbų vaikui.',
    'Konsultacija naudinga, bet per trumpa. 45 min. būtų geriau nei 30.',
    'Specialistė profesionali ir maloni. Vaikas eina noriai. Rekomenduoju.',
  ]},
  { rating: 3, texts: [
    'Specialistas kompetentingas, bet bendravimas su tėvais galėtų būti geresnis.',
    'Vizitas buvo greitas, norėjosi daugiau laiko ir dėmesio.',
    'Normalu, bet tikėjomės didesnio progreso per tą laiką.',
    'Logopedė normalė, bet mūsų vaikas su ja nesusibendrauja. Gal ne ta „chemija".',
    'Specialistas kompetentingas, bet patalpos labai senos ir nejauku.',
    'Per brangu — 40€ už 30 min. O rezultatas — vidutiniškas.',
    'Psichologė profesionali, bet per daug „pagal knygą". Trūksta individualaus požiūrio.',
    'Vizitai formalūs — vaikas atlieka užduotis ir viskas. Norėtųsi šiltesnio kontakto.',
    'Eilėje laukėme 3 mėnesius, o pats vizitas — 20 minučių. Nusivylėme.',
    'Specialistė OK, bet progresas per lėtas. Gal reikia intensyvesnių užsiėmimų.',
    'Logopedė normalė. Vaikas neverkia, bet ir nesidžiaugia einant.',
    'Vidutiniškas vertinimas. Specialistas profesionalus, bet trūksta šilumos.',
    'Kaina neatitinka kokybės. Tikėjomės daugiau.',
    'Normalus specialistas. Nei labai gerai, nei blogai.',
    'Konsultacija buvo paviršutiniška. Norėjosi gilesnės analizės.',
  ]},
  { rating: 2, texts: [
    'Ilgas laukimas, trumpas vizitas. Lūkesčiai nepatenkinti.',
    'Specialistas per daug formalus — vaikas bijojo ir verkė visą vizitą.',
    'Už tokią kainą tikėjomės daugiau. Progresas nulinis po 3 mėnesių.',
    'Logopedė grubi su vaiku — „neišdykauk", „sėdėk ramiai". Tai ne metodas.',
    'Specialistė nuolat vėluoja ir trumpina vizitus. Nemandagu.',
    'Patalpos labai nejauku — sena poliklinika, šalta, tamsiai. Vaikas bijojo.',
    'Psichologė po pirmo vizito pasakė „nieko blogo nematau" — bet problema akivaizdi.',
    'Diagnozė buvo neteisinga — kitas specialistas rado visai kitą problemą.',
    'Vaikas po vizitų tapo dar labiau užsisklendęs. Ne tas metodas.',
    'Specialistas nemoka dirbti su mažais vaikais — tinka tik mokyklinio amžiaus.',
  ]},
  { rating: 1, texts: [
    'Specialistas visiškai nekompetentingas. Diagnozavo tai ko nėra, o tikrą problemą ignoravo.',
    'Siaubinga patirtis — vaikas verkė, o specialistė liepė „nustoti lepinti".',
    'Praleidome 4 mėnesius ir 400€ — jokio rezultato. Tik švaistėme laiką.',
    'Specialistas paliko vaiką vieną kambaryje „testuoti" — vaikas išsigando ir verkė 20 min.',
    'Blogiausia konsultacija. Specialistas buvo nemandagus, arogantiškas ir nepadėjo.',
  ]},
];

// ──────────────────────────────────────────────────────────────
// Rating distribution weights (per review)
// Target: 5% ★1, 10% ★2, 20% ★3, 35% ★4, 30% ★5
// ──────────────────────────────────────────────────────────────
const RATING_WEIGHTS = [
  { rating: 1, weight: 0.05 },
  { rating: 2, weight: 0.10 },
  { rating: 3, weight: 0.20 },
  { rating: 4, weight: 0.35 },
  { rating: 5, weight: 0.30 },
];

// Deterministic pseudo-random based on seed string
function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function pickWeightedRating(rand: () => number): number {
  const r = rand();
  let cumulative = 0;
  for (const { rating, weight } of RATING_WEIGHTS) {
    cumulative += weight;
    if (r < cumulative) return rating;
  }
  return 4; // fallback
}

function pickReviewText(
  templates: Array<{rating: number; texts: string[]}>,
  targetRating: number,
  rand: () => number,
  usedTexts: Set<string>,
): { rating: number; text: string } {
  // Find template group for target rating
  const group = templates.find(t => t.rating === targetRating);
  if (!group || group.texts.length === 0) {
    // Fallback: pick closest rating
    const sorted = [...templates].sort((a, b) => Math.abs(a.rating - targetRating) - Math.abs(b.rating - targetRating));
    const fallback = sorted[0];
    const text = fallback.texts[Math.floor(rand() * fallback.texts.length)];
    return { rating: fallback.rating, text };
  }

  // Try to pick unused text first
  const unusedTexts = group.texts.filter(t => !usedTexts.has(t));
  if (unusedTexts.length > 0) {
    const text = unusedTexts[Math.floor(rand() * unusedTexts.length)];
    return { rating: group.rating, text };
  }

  // All used — just pick random
  const text = group.texts[Math.floor(rand() * group.texts.length)];
  return { rating: group.rating, text };
}

const templateMap: Record<string, Array<{rating: number; texts: string[]}>> = {
  kindergarten: kindergartenReviews,
  aukle: aukleReviews,
  burelis: burelisReviews,
  specialist: specialistReviews,
};

async function seedReviews() {
  console.log('🔄 Seeding authentic reviews for ALL items with baseReviewCount > 0...');
  console.log('Target distribution: 5% ★1, 10% ★2, 20% ★3, 35% ★4, 30% ★5\n');

  // Delete all existing reviews
  const deleted = await prisma.review.deleteMany({});
  console.log(`Deleted ${deleted.count} existing reviews.`);

  // Get ALL items with baseReviewCount > 0
  const [kindergartens, aukles, bureliai, specialists] = await Promise.all([
    prisma.kindergarten.findMany({ where: { baseReviewCount: { gt: 0 } }, select: { id: true, name: true, baseReviewCount: true, baseRating: true } }),
    prisma.aukle.findMany({ where: { baseReviewCount: { gt: 0 } }, select: { id: true, name: true, baseReviewCount: true, baseRating: true } }),
    prisma.burelis.findMany({ where: { baseReviewCount: { gt: 0 } }, select: { id: true, name: true, baseReviewCount: true, baseRating: true } }),
    prisma.specialist.findMany({ where: { baseReviewCount: { gt: 0 } }, select: { id: true, name: true, baseReviewCount: true, baseRating: true } }),
  ]);

  console.log(`Items: kindergartens=${kindergartens.length}, aukles=${aukles.length}, bureliai=${bureliai.length}, specialists=${specialists.length}`);

  const reviews: Array<{
    itemId: string;
    itemType: string;
    authorName: string;
    rating: number;
    text: string;
    isApproved: boolean;
    createdAt: Date;
  }> = [];

  function generateReviewsForItem(
    item: { id: string; name: string; baseReviewCount: number; baseRating: number },
    itemType: string,
  ) {
    const numReviews = item.baseReviewCount;
    const rand = seededRandom(item.id);
    const templates = templateMap[itemType];
    const usedTexts = new Set<string>();

    for (let i = 0; i < numReviews; i++) {
      const targetRating = pickWeightedRating(rand);
      const { rating, text } = pickReviewText(templates, targetRating, rand, usedTexts);
      usedTexts.add(text);

      // Pick author name
      const nameIdx = Math.floor(rand() * allNames.length);
      const authorName = allNames[nameIdx];

      // Random date in the last 18 months
      const daysAgo = Math.floor(rand() * 540);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(Math.floor(rand() * 14) + 7);
      createdAt.setMinutes(Math.floor(rand() * 60));
      createdAt.setSeconds(Math.floor(rand() * 60));

      reviews.push({
        itemId: item.id,
        itemType,
        authorName,
        rating,
        text,
        isApproved: true,
        createdAt,
      });
    }
  }

  for (const item of kindergartens) generateReviewsForItem(item, 'kindergarten');
  for (const item of aukles) generateReviewsForItem(item, 'aukle');
  for (const item of bureliai) generateReviewsForItem(item, 'burelis');
  for (const item of specialists) generateReviewsForItem(item, 'specialist');

  console.log(`\nTotal reviews to create: ${reviews.length}`);

  // Batch insert
  const BATCH_SIZE = 200;
  let created = 0;
  for (let i = 0; i < reviews.length; i += BATCH_SIZE) {
    const batch = reviews.slice(i, i + BATCH_SIZE);
    const result = await prisma.review.createMany({ data: batch });
    created += result.count;
    if ((i / BATCH_SIZE) % 5 === 0) {
      console.log(`  Progress: ${created}/${reviews.length}`);
    }
  }

  console.log(`\nCreated ${created} reviews.`);

  // Print distribution
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(r => dist[r.rating]++);
  console.log('\nRating distribution:');
  for (let s = 1; s <= 5; s++) {
    console.log(`  ★${s}: ${dist[s]} (${(dist[s] * 100 / reviews.length).toFixed(1)}%)`);
  }

  // Check uniqueness
  const textCounts: Record<string, number> = {};
  reviews.forEach(r => { textCounts[r.text] = (textCounts[r.text] || 0) + 1; });
  const uniqueTexts = Object.keys(textCounts).length;
  const maxDupes = Math.max(...Object.values(textCounts));
  console.log(`\nUnique texts: ${uniqueTexts}`);
  console.log(`Max repetitions of any single text: ${maxDupes}`);

  // Update baseReviewCount and baseRating on ALL items
  console.log('\nUpdating base review counts and ratings...');

  async function updateCounts(items: Array<{ id: string }>, itemType: string, model: string) {
    for (const item of items) {
      const approvedReviews = await prisma.review.findMany({
        where: { itemId: item.id, itemType, isApproved: true },
        select: { rating: true },
      });
      const count = approvedReviews.length;
      const avg = count > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / count
        : 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any)[model].update({
        where: { id: item.id },
        data: {
          baseReviewCount: count,
          baseRating: count > 0 ? Math.round(avg * 10) / 10 : 0,
        },
      });
    }
  }

  const [allKg, allAukle, allBurelis, allSpec] = await Promise.all([
    prisma.kindergarten.findMany({ select: { id: true } }),
    prisma.aukle.findMany({ select: { id: true } }),
    prisma.burelis.findMany({ select: { id: true } }),
    prisma.specialist.findMany({ select: { id: true } }),
  ]);

  await updateCounts(allKg, 'kindergarten', 'kindergarten');
  console.log('  ✓ Kindergartens updated.');
  await updateCounts(allAukle, 'aukle', 'aukle');
  console.log('  ✓ Aukles updated.');
  await updateCounts(allBurelis, 'burelis', 'burelis');
  console.log('  ✓ Bureliai updated.');
  await updateCounts(allSpec, 'specialist', 'specialist');
  console.log('  ✓ Specialists updated.');

  console.log('\n✅ Review seeding complete!');
}

seedReviews()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
