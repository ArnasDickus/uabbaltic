import { IPageParamProps } from "@/constants/interfaces";
import { FC } from "react";

import RegisterForm from "./components/register-form";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { formContainerClassNames } from "@/styles/reusable-styles";
import PageContainer from "@/styles/components/page-container";
import { ServerFooter } from "@/components/layout/footer/serverfooter";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description: "A place to register",
  keywords: ["Register"],
};

const PageRegister: FC<IPageParamProps> = async ({ params: { lng } }) => {
  const session = await getServerSession();
  if (session) {
    redirect("/");
  }
  return (
    <PageContainer footer={<ServerFooter language={lng} path="/register" />}>
      <div className={formContainerClassNames}>
        <RegisterForm language={lng} />
      </div>
    </PageContainer>
  );
};
export default PageRegister;
