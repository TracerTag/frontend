import dynamic from "next/dynamic";
import Head from "next/head";

import { DropZone } from "~/components/DropZone";
import { LabelerLayout } from "~/components/LabelerLayout";
import NavBar from "~/components/NavBar";
import { useAppStore } from "~/store/app-store";

export default function Home() {
  const imageUrl = useAppStore((state) => state.imageUrl);

  return (
    <>
      <Head>
        <title>TracerTag</title>
        <meta
          name="description"
          content="TracerTag for NOI Hackathon Summer 2024"
        />
        <meta
          name="author"
          content="Giacomo Ferretti, Oliviero Petrucci, Davide Sbetti, Alessandro Taufer"
        />
        <meta
          name="copyright"
          content="Giacomo Ferretti, Oliviero Petrucci, Davide Sbetti, Alessandro Taufer"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex min-h-full flex-col">
        <NavBar />
        {!imageUrl && (
          <div className="flex flex-1 p-8">
            <DropZone />
          </div>
        )}
        {imageUrl && <LabelerLayout />}
      </div>
    </>
  );
}
