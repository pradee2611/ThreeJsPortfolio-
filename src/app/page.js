"use client";
import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Loader from "@/components/Loader";
import Cursor from "@/components/Cursor";
import MouseTrail from "@/components/MouseTrail";
import Navbar from "@/components/Navbar";
import ScrollProgress from "@/components/ScrollProgress";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Vista from "@/components/Vista";
import Expertise from "@/components/Expertise";
import Experience from "@/components/Experience";
import Orbit from "@/components/Orbit";
import Work from "@/components/Work";
import Recognitions from "@/components/Recognitions";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import lenisRef from "@/lib/lenis-instance";

const BackgroundScene = dynamic(() => import("@/components/BackgroundScene"), { ssr: false });

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true }); // don't re-layout every time the phone's URL bar hides

export default function Home() {
  const [sceneReady, setSceneReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const onDone = useCallback(() => setLoaded(true), []);
  const onSceneReady = useCallback(() => setSceneReady(true), []);

  // Always start the story at the top, and keep the page still while it loads.
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.documentElement.classList.add("is-loading");
  }, []);

  useEffect(() => {
    if (!loaded) return;
    document.documentElement.classList.remove("is-loading");
    lenisRef.current?.start();
    ScrollTrigger.refresh();
  }, [loaded]);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.075,
      smoothWheel: true,
      wheelMultiplier: 1,
    });
    lenisRef.current = lenis;
    lenis.stop(); // resumed once the loader is gone

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time) => { lenis.raf(time * 1000); };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Journey waypoints depend on section layout — refresh once
    // everything (fonts, images) has settled.
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
      gsap.ticker.remove(tick);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  return (
    <main>
      <BackgroundScene onReady={onSceneReady} />
      <div className="aurora" aria-hidden="true" />
      <div className="grain-overlay" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      {!loaded && <Loader sceneReady={sceneReady} onDone={onDone} />}
      <Cursor />
      <MouseTrail />
      <ScrollProgress />
      <Navbar />

      <div className="relative z-10">
        <Hero ready={loaded} />
        <Vista />
        <About />
        <Expertise />
        <Experience />
        <Orbit />
        <Work />
        <Recognitions />
        <Contact />
        <Footer />
      </div>
    </main>
  );
}
