import { HeroExperience } from '../sections/home/Hero/HeroExperience';
import { NewDrop } from '../sections/home/NewDrop';
import { TopsRail } from '../sections/home/TopsRail';
import { FootwearChamber } from '../sections/home/FootwearChamber';
import { BottomsEditorial } from '../sections/home/BottomsEditorial';
import { Runway } from '../sections/home/Runway';
import { Campaign } from '../sections/home/Campaign';
import { CategoryTiles } from '../sections/home/CategoryTiles';
import { FeaturedPicks } from '../sections/home/FeaturedPicks';

/** Order sets the rhythm: ink, bone, electric, indigo, ink, bone, ink. The
    hero and New Drop share ink for a seamless handoff, as do the last two. */
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
