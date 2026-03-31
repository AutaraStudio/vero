import { sanityFetch } from '@/sanity/lib/live';
import { JOB_CATEGORIES_QUERY } from '@/sanity/lib/queries';
import AssessmentsHero from './AssessmentsHero';
import AssessmentsGrid from './AssessmentsGrid';
import './assessments.css';

export default async function AssessmentsPage() {
  const { data: categories } = await sanityFetch({ query: JOB_CATEGORIES_QUERY });

  return (
    <main>
      <AssessmentsHero />
      <AssessmentsGrid categories={categories ?? []} />
    </main>
  );
}
