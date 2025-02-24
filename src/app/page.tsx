'use client'
import React from "react";
import { useScroll, useTransform } from "framer-motion";
import { HeroParallax } from "@/components/global/connect-parallax";
import { GoogleGeminiEffect } from "@/components/global/google-gemini-effect";
import Navbar from "@/components/global/navbar";
import { InfiniteMovingCards } from "@/components/global/infinite-moving-cards";
import { clients, products } from '@/lib/constant';
import { ContainerScroll } from '@/components/global/container-scroll-animation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const pathLengthFirst = useTransform(scrollYProgress, [0, 0.8], [0.2, 1.2]);
  const pathLengthSecond = useTransform(scrollYProgress, [0, 0.8], [0.15, 1.2]);
  const pathLengthThird = useTransform(scrollYProgress, [0, 0.8], [0.1, 1.2]);
  const pathLengthFourth = useTransform(scrollYProgress, [0, 0.8], [0.05, 1.2]);
  const pathLengthFifth = useTransform(scrollYProgress, [0, 0.8], [0, 1.2]);

  return (
    <div className="overflow-x-hidden">
      <main className="flex items-center justify-center flex-col relative w-full">
        <Navbar />
        <div className="absolute top-50% left-0 w-full h-screen z-30">
          <Link href="/(main)/(pages)/dashboard" passHref>
            <Button
              size={'lg'}
              className="p-8 mb-8 md:mb-0 text-2xl w-full sm:w-fit border-t-2 rounded-full border-[#4D4D4D] bg-[#1F1F1F] hover:bg-white group transition-all flex items-center justify-center gap-4 hover:shadow-xl hover:shadow-neutral-500 duration-500"
              style={{
                position: 'fixed',
                top: '20%',
                left: '50%',
                zIndex: 30,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-neutral-500 to-neutral-600 md:text-center font-sans group-hover:bg-gradient-to-r group-hover:from-black group-hover:to-black">
                Start
              </span>
            </Button>
          </Link>
          <GoogleGeminiEffect
            pathLengths={[
              pathLengthFirst,
              pathLengthSecond,
              pathLengthThird,
              pathLengthFourth,
              pathLengthFifth,
            ]}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 20,
            }}
          />
        </div>
        <section className="h-screen w-full bg-neutral-950 rounded-md overflow-hidden relative flex flex-col items-center antialiased z-10">
          <div className="absolute inset-0 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_35%,#223_100%)]"></div>
          <div className="flex flex-col mt-[-100px] md:mt-[-50px]">
            <ContainerScroll
              titleComponent={
                <div className="flex items-center flex-col">
                  <h1 className="text-5xl md:text-8xl bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-600 font-sans font-bold">
                    Automate Your Work With APP
                  </h1>
                </div>
              }
            />
          </div>
        </section>
        <InfiniteMovingCards
          className="md:mt-[18rem] mt-[-100px]"
          items={clients}
          direction="right"
          speed="slow"
        />
        <section style={{ zIndex: 30 }}>
          <HeroParallax products={products}></HeroParallax>
        </section>
      </main>
    </div>
  );
};