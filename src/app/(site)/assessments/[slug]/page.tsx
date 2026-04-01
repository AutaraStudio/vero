type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  return { title: slug };
}

export default async function CategoryPage({ params }: { params: Params }) {
  await params;
  return <main></main>;
}
