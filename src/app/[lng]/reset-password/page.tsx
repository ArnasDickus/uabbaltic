import { formContainerClassNames } from "@/styles/reusable-styles";
import ResetPasswordForm from "./components/reset-password-form";
import { IPageParamProps } from "@/constants/interfaces";
import PageContainer from "@/styles/components/page-container";
import { ServerFooter } from "@/components/layout/footer/serverfooter";

const PageResetPassword = ({ params, searchParams }: IPageParamProps) => {
  return (
    <PageContainer
      footer={<ServerFooter language={params.lng} path="/reset-password" />}>
      <div className={formContainerClassNames}>
        <ResetPasswordForm
          language={params.lng}
          token={searchParams.token as string}
        />
      </div>
    </PageContainer>
  );
};
export default PageResetPassword;
