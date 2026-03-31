import { sanityFetch } from '@/sanity/lib/live';
import { ROLES_BY_CATEGORY_QUERY } from '@/sanity/lib/queries';
import RolePicker from './components/RolePicker';

export default async function GetStartedPage() {
  const { data: categories } = await sanityFetch({ query: ROLES_BY_CATEGORY_QUERY });

  return <RolePicker categories={categories ?? []} />;
}
