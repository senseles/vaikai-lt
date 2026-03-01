import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privatumo politika | Vaikai.lt',
  description: 'Vaikai.lt privatumo politika — kaip renkame, saugome ir naudojame jūsų duomenis.',
  alternates: {
    canonical: 'https://vaikai.lt/privatumo-politika',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Navigacija">
        <Link href="/" className="hover:text-primary transition-colors">Pradžia</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-200 font-medium">Privatumo politika</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Privatumo politika</h1>

      <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
        <p className="text-sm text-gray-500 dark:text-gray-400">Paskutinis atnaujinimas: 2026-03-01</p>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">1. Bendrosios nuostatos</h2>
          <p>
            Vaikai.lt (toliau — &bdquo;Platforma&ldquo;) gerbia jūsų privatumą ir įsipareigoja saugoti jūsų asmens duomenis
            pagal Europos Sąjungos Bendrąjį duomenų apsaugos reglamentą (BDAR/GDPR) ir Lietuvos Respublikos
            asmens duomenų teisinės apsaugos įstatymą.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">2. Kokie duomenys renkami</h2>
          <p>Platforma renka minimalų kiekį duomenų, reikalingų paslaugos teikimui:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Atsiliepimai:</strong> autoriaus vardas (slapyvardis), įvertinimas ir atsiliepimo tekstas. Pateikiant atsiliepimą registracija nebūtina.</li>
            <li><strong>Mėgstamiausieji:</strong> pasirinkti elementai saugomi tik jūsų naršyklėje (localStorage) ir nėra siunčiami į serverį.</li>
            <li><strong>Techniniai duomenys:</strong> IP adresas (naudojamas užklausų ribojimui), naršyklės tipas ir puslapio URL.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">3. Slapukai (cookies)</h2>
          <p>Platforma naudoja tik būtinus funkcinius slapukus:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>cookie-consent</strong> — įsimena, kad sutikote su slapukų naudojimu (localStorage).</li>
            <li><strong>theme</strong> — įsimena jūsų pasirinktą šviesų/tamsų režimą (localStorage).</li>
            <li><strong>admin_token</strong> — administratoriaus sesijos raktas (tik administratoriams, httpOnly).</li>
          </ul>
          <p>Platforma <strong>nenaudoja</strong> reklaminių, stebėjimo ar trečiųjų šalių slapukų.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">4. Duomenų naudojimas</h2>
          <p>Surinkti duomenys naudojami tik šiais tikslais:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Atsiliepimų rodymas kitoms naudotojams (po administratoriaus patvirtinimo).</li>
            <li>Piktnaudžiavimo prevencija (užklausų ribojimas pagal IP adresą).</li>
            <li>Platformos veikimo gerinimas.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">5. Jūsų teisės (BDAR)</h2>
          <p>Pagal BDAR turite šias teises:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Teisė susipažinti</strong> — sužinoti, kokie jūsų duomenys tvarkomi.</li>
            <li><strong>Teisė ištaisyti</strong> — prašyti pataisyti netikslius duomenis.</li>
            <li><strong>Teisė ištrinti</strong> — prašyti pašalinti savo atsiliepimus ar duomenis.</li>
            <li><strong>Teisė apriboti tvarkymą</strong> — prašyti laikinai sustabdyti duomenų tvarkymą.</li>
            <li><strong>Teisė nesutikti</strong> — nesutikti su duomenų tvarkymu tam tikrais tikslais.</li>
          </ul>
          <p>
            Norėdami pasinaudoti šiomis teisėmis, kreipkitės el. paštu: <strong>info@vaikai.lt</strong>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">6. Duomenų saugojimas</h2>
          <p>
            Atsiliepimai saugomi neribotą laiką arba iki autoriaus prašymo juos pašalinti.
            Techniniai duomenys (IP adresai užklausų ribojimui) saugomi tik atmintyje ir ištrinami
            perkrovus serverį.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">7. Duomenų perdavimas</h2>
          <p>
            Jūsų asmens duomenys <strong>nėra perduodami</strong> trečiosioms šalims, neparduodami
            ir nenaudojami reklamos tikslais.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">8. Kontaktai</h2>
          <p>
            Jei turite klausimų dėl privatumo politikos, kreipkitės:
          </p>
          <p className="mt-2">
            <strong>El. paštas:</strong> info@vaikai.lt
          </p>
        </section>
      </div>
    </div>
  );
}
