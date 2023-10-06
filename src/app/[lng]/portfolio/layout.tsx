import PortfolioHeader from "@/components/layout/headers/portfolio-header";
import { ReactNode } from "react";

const PortfolioLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <PortfolioHeader language="lng" />
      {children}
    </>
  );
};

export default PortfolioLayout;
