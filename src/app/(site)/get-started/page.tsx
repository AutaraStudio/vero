import { Suspense } from 'react';
import { client } from '@/sanity/lib/client';
import { ROLES_BY_CATEGORY_QUERY } from '@/sanity/lib/queries';
import RolePicker from './components/RolePicker';

export default async function GetStartedPage() {
  const categories = await client.fetch(ROLES_BY_CATEGORY_QUERY);
  return (
    <Suspense>
      <RolePicker categories={categories ?? []} />
    </Suspense>
  );
}
