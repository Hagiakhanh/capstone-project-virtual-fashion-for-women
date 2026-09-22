import HomeIntroSection from "@/components/Home/HomeIntro";
import HomeProductSection from "@/components/Home/HomeProduct";
import HomeRecommendSection from "@/components/Home/HomeRecommend";
import { HomeSaleCampaign } from "@/components/Home/HomeSaleCampaign";

export default function Home() {
  return (
    <>
      <div className="bg-gradient-to-b from-[#FAE3B6] via-[#FAE3B6] via-40% to-white">
        <HomeIntroSection />
        <HomeProductSection />
        <HomeRecommendSection />
        <HomeSaleCampaign/>
      </div>
    </>
  );
}
