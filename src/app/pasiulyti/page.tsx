import type { Metadata } from 'next';
import SubmissionForm from './SubmissionForm';

export const metadata: Metadata = {
  title: 'Pasiūlyti naują įrašą | ManoVaikai.lt',
  description: 'Pasiūlykite naują darželį, auklę, būrelį ar specialistą mūsų platformai.',
  robots: { index: true, follow: true },
};

export default function PasiulytiPage({
  searchParams,
}: {
  searchParams: { name?: string; city?: string; type?: string };
}) {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Pasiūlykite naują įrašą
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Žinote darželį, auklę, būrelį ar specialistą, kurio nerandate mūsų platformoje?
        Pasiūlykite — mes peržiūrėsime ir pridėsime!
      </p>
      <SubmissionForm
        defaultName={searchParams.name}
        defaultCity={searchParams.city}
        defaultType={searchParams.type}
      />
    </main>
  );
}
