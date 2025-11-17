import React from "react";
import { Hero } from "../components/Hero";
import { ServicesOverview } from "../components/ServicesOverview";

export function HomePage() {
  return (
    <div>
      <Hero />
      <ServicesOverview />
    </div>
  );
}
