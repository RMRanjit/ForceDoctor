// "use client";

import Profile from "../components/common/Profile";
import { topics, type Topic } from "@/config/homeTopics.config";

import Image from "next/image";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-self-auto">
      <header className="flex w-full justify-between p-1 bg-primary text-primary-foreground ">
        <div className="flex flex-row">
          <Image
            src="/cognizant.svg"
            height={1}
            width={1}
            priority={false}
            style={{ height: "", width: "3vw" }}
            quality={50}
            alt="Company Logo"
          ></Image>

          <div className="px-5">
            <h1 className="text-2xl  font-bold tracking-[.12em]">
              Salesforce Platform Health Check
            </h1>
            <h3 className=" tracking-widest ">
              Diagnose & Optimize: Get Your Platform in Top Shape
            </h3>
          </div>
        </div>

        <div>
          <Profile />
        </div>
      </header>
      <div
        style={{ height: "100px", overflow: "hidden" }}
        className="z-10 w-full items-center justify-between  "
      >
        <svg
          viewBox="0 0 500 250"
          preserveAspectRatio="none"
          className="fill-current"
          style={{ height: "100%", width: "100%" }}
        >
          <path d="M-0.84,147.55 C149.99,150.00 276.24,-49.81 500.84,148.53 L500.00,0.00 L0.00,0.00 Z"></path>
        </svg>
      </div>
      <section className=" flex flex-row flex-wrap gap-10 mx-auto px-10 items-center">
        {topics.map((topic: Topic, topicIndex: number) => {
          return (
            <Card
              key={topic.Title + topicIndex}
              className=" rounded-md h-60 w-96 shadow-xl flex flex-col hover:shadow-2xl
              hover:border-b-8 hover:border-primary "
            >
              <CardHeader>
                <CardTitle>{topic.Title}</CardTitle>
                <CardDescription
                  className="line-clamp-5"
                  style={{ height: "5lh" }}
                >
                  {topic.Description}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Link
                  href={topic.hyperLink}
                  className="flex flex-row mt-2 align-right"
                >
                  {topic.hyperLinkText} <ArrowRight color="gray" size={24} />
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </section>
    </main>
  );
}
