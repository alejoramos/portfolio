import { HeroExperience } from '../sections/home/Hero/HeroExperience';
import { NewDrop } from '../sections/home/NewDrop';
import { TopsRail } from '../sections/home/TopsRail';
import { FootwearChamber } from '../sections/home/FootwearChamber';
import { BottomsEditorial } from '../sections/home/BottomsEditorial';
import { Runway } from '../sections/home/Runway';
import { Campaign } from '../sections/home/Campaign';
import { CategoryTiles } from '../sections/home/CategoryTiles';
import { FeaturedPicks } from '../sections/home/FeaturedPicks';

/**
 * Section order is a deliberate rhythm of tone and density:
 * ink → bone → electric → indigo → ink → bone → ink → ink.
 * No two adjacent sections share a background value or a motion signature.
 */
export default function Home() {
  return (
    <>
      <HeroExperience />
      <NewDrop />
      <TopsRail />
      <FootwearChamber />
      <BottomsEditorial />
      <Runway />
      <Campaign />
      <CategoryTiles />
      <FeaturedPicks />
    </>
  );
}
