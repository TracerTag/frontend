import dynamic from "next/dynamic";

const ResizeTest = dynamic(
  () => import("../../components/ResizeTest").then((m) => m.ResizeTest),
  {
    ssr: false,
  },
);

export default function Home() {
  return (
    <>
      <ResizeTest />
    </>
  );
}
