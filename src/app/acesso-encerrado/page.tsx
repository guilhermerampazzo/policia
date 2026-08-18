import ExpiredAccess from "@/components/ExpiredAccess";

export default async function AcessoEncerradoPage({ searchParams }: { searchParams: Promise<{ ate?: string }> }) {
  const { ate } = await searchParams;
  return <ExpiredAccess acessoAte={ate ?? null} />;
}
