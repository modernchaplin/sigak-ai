import Link from "next/link";

export default function Home() {
  const menus = [
    {
      href: "/timeline",
      title: "역사",
      desc: "시각화 언어가 어떻게 발전했는지 연대기 흐름으로 확인",
    },
    {
      href: "/speed",
      title: "속도체험",
      desc: "정보를 빠르게 읽고 판단하게 만드는 구성 원리 정리",
    },
    {
      href: "/future",
      title: "미래",
      desc: "향후 3-5년 시각 AI 인터페이스의 변화 시나리오",
    },
    {
      href: "/glossary",
      title: "용어",
      desc: "MVP 설계와 시각화 실무에서 자주 쓰는 핵심 개념",
    },
  ];

  return (
    <section className="space-y-8">
      <div className="space-y-3 border-b border-black/10 pb-6">
        <p className="mono text-xs tracking-[0.16em] text-slate-500">SIGAK.AI MVP</p>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight">시각 AI 내러티브를 빠르게 훑는 미니멀 인포그래픽 구조</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          상단 메뉴에서 원하는 섹션으로 이동하세요. 각 페이지에서 기본 정보와
          <strong> 송시헌의 시각</strong> 토글을 함께 확인할 수 있습니다.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {menus.map((menu) => (
          <Link
            key={menu.href}
            href={menu.href}
            className="info-card rounded-2xl p-5 transition hover:border-black/30"
          >
            <p className="badge mono inline-flex rounded-full px-3 py-1 text-xs tracking-[0.14em]">
              MENU
            </p>
            <h2 className="mt-4 text-2xl font-semibold">{menu.title}</h2>
            <p className="mt-2 text-sm text-slate-700">{menu.desc}</p>
          </Link>
        ))}
      </div>
      <div className="info-card rounded-2xl p-5">
        <p className="mono text-xs tracking-[0.14em] text-blue-700">MVP NOTE</p>
        <p className="mt-2 text-sm text-slate-700">
          데이터는 DB 없이 JSON 파일로 관리되며, 필요하면 바로 항목을 추가해 확장할 수 있습니다.
        </p>
      </div>
    </section>
  );
}
