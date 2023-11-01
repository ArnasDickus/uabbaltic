"use client";
import Button from "@/components/button/button";
import Input from "@/components/input/input";
import LinkButton from "@/components/link-button/link-button";
import { useForm, SubmitHandler } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import { IPageRegisterInputs } from "./interfaces";
import debounce from "lodash/debounce";
import { apiRoutes } from "@/constants/routes";
import SnackAlert, { ISnackAlert } from "@/components/snack-alert/snack-alert";
import { useState } from "react";
import { StatusCodes } from "@/constants/status-code";
import { GET_USER } from "@/components/store/modules/user/query";
import client from "../../../../../apollo-client";

const RegisterForm = ({ language }: { language: string }) => {
  const [alert, setAlert] = useState<ISnackAlert>({
    message: "",
    severity: "success",
    showAlert: false,
  });

  const isEmailExist = async (email: string): Promise<boolean> => {
    const isEmailExist: boolean = await client
      .query({
        query: GET_USER,
        variables: {
          whereUser: {
            email: { _eq: email },
          },
        },
      })
      .then((user) => !!user.data.user.length)
      .catch((error) => {
        console.error("isEmailExist >", error);
        return false;
      });

    return !isEmailExist;
  };

  const isUsernameExist = async (username: string) => {
    const isUsernameExist: boolean = await client
      .query({
        query: GET_USER,
        variables: {
          whereUser: {
            username: { _eq: username },
          },
        },
      })
      .then((user) => !!user.data.user.length)
      .catch((error) => {
        console.error("isUsernameExist >", error);
        return false;
      });

    return isUsernameExist;
  };

  const debouncedCheckEmail = debounce(isEmailExist, 1500);
  const debouncedCheckUsername = debounce(isUsernameExist, 1500);
  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Privaloma"),
    email: Yup.string()
      .email()
      .required("Privaloma")
      .test("checkEmailUnique", "This Email already in use", async (email) => {
        const uniqueEmail = await debouncedCheckEmail(email);
        return !uniqueEmail as boolean;
      }),
    username: Yup.string()
      .required("Privaloma")
      .test(
        "checkUsernameUnique",
        "This Username already in use",
        async (username) => {
          const uniqueUsername = await debouncedCheckUsername(username);
          return !uniqueUsername as boolean;
        }
      ),
    password: Yup.string()
      .required("No password provided.")
      .min(8, "Password is too short - should be 8 chars minimum.")
      .matches(/[a-zA-Z]/, "Password can only contain Latin letters."),
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isLoading, isSubmitting },
  } = useForm<IPageRegisterInputs>({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<IPageRegisterInputs> = async (data) => {
    const newUser = await fetch(apiRoutes["create-user"], {
      method: "POST",
      body: JSON.stringify({ formData: data, language: language }),
    });
    if (newUser.status === StatusCodes.okStatus) {
      setAlert({
        message: "Email was sent.",
        severity: "success",
        showAlert: true,
      });
    } else if (newUser.status === StatusCodes.internalServerError) {
      setAlert({
        message: "Something went wrong, please try again later",
        severity: "error",
        showAlert: true,
      });
    }
  };
  return (
    <>
      <SnackAlert
        {...alert}
        onClose={() => {
          setAlert((prevState) => ({
            ...prevState,
            showAlert: false,
          }));
        }}
      />
      <form
        className="bg-white shadow-md rounded px-8 pb-8 mb-4"
        onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <Input
            name="Name"
            errorText={errors.name?.message}
            inputProps={{
              type: "text",
              disabled: isSubmitting,
              ...register("name"),
            }}
          />
        </div>
        <div className="mb-4">
          <Input
            name="Username"
            errorText={errors.username?.message}
            inputProps={{
              type: "text",
              disabled: isSubmitting,
              ...register("username"),
            }}
          />
        </div>
        <div className="mb-4">
          <Input
            name="Email"
            errorText={errors.email?.message}
            inputProps={{
              type: "text",
              disabled: isSubmitting,
              ...register("email"),
            }}
          />
        </div>
        <div className="mb-6">
          <Input
            name="Password"
            errorText={errors.password?.message}
            inputProps={{
              type: "password",
              disabled: isSubmitting,
              ...register("password"),
            }}
          />
        </div>
        <div className="flex items-center justify-between">
          <Button
            buttonProps={{
              disabled: isSubmitting,
              type: "submit",
            }}>
            Register
          </Button>
          <LinkButton
            linkProps={{
              // @ts-ignore
              href: `/${language}/forgot-password`,
            }}>
            Forgot Password?
          </LinkButton>
        </div>
      </form>
    </>
  );
};
export default RegisterForm;
