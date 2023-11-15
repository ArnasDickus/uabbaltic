import { FC } from "react";
import { IPageParamProps } from "@/constants/interfaces";
import { ServerFooter } from "@/components/layout/footer/serverfooter";
import PageContainer from "@/styles/components/page-container";
import HeroSection from "./components/hero-section/hero-section";

const Home: FC<IPageParamProps> = async ({ params: { lng } }) => {
  return (
    <PageContainer footer={<ServerFooter language={lng} path="/" />}>
      <HeroSection language={lng} />
    </PageContainer>
  );
};

export default Home;
