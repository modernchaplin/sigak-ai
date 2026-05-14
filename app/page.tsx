import SigakHome from "@/app/components/sigak-home";
import type { SigakAxis } from "@/app/components/sigak-home";
import sigakMvp from "@/data/sigak.mvp.json";

export default function Home() {
  return <SigakHome axes={sigakMvp.axes as SigakAxis[]} />;
}
