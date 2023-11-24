import client from "../../../../apollo-client";
import { IPageRegisterInputs } from "@/app/[lng]/register/components/interfaces";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { transporter } from "@/app/providers/email";
import { StatusCodes } from "@/constants/status-code";
import { getBaseUrl } from "@/app/utils/get-base-url";

import dayjs from "dayjs";
import { generateToken } from "@/app/utils/generate-email-confirmation-token";
import { ADD_USER, DELETE_USER } from "@/store/modules/user/query";
import { ADD_USER_CONFIRMATION } from "@/store/modules/user-confirmation/query";
import {
  AddUserConfirmationMutation,
  AddUserConfirmationMutationVariables,
  AddUserMutation,
  AddUserMutationVariables,
} from "@/gql/graphql";
import { errorResponseHandler } from "@/app/utils/error-response-handler";

interface CustomNextApiRequest extends NextRequest {
  json: () => Promise<NCreateUser.IRequest["body"]>;
}

const createUser = async (requestData: NCreateUser.IRequest["body"]) => {
  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(requestData.formData.password, salt);

    const newUserId = await client
      .mutate<AddUserMutation, AddUserMutationVariables>({
        mutation: ADD_USER,
        variables: {
          addUserObject: {
            name: requestData.formData.name,
            password: hash,
            email: requestData.formData.email,
            username: requestData.formData.username,
            email_confirmed: false,
          },
        },
      })
      .then((val) => val.data?.insert_user?.returning[0].id);

    if (!newUserId) {
      throw new Error("Failed Add User");
    } else {
      return newUserId;
    }
  } catch (error) {
    errorResponseHandler(error, "Failed Add User");
    throw new Error("Failed Add User");
  }
};

const addUserConfirmation = async (
  newUserId: number,
  confirmationToken: string
) => {
  try {
    await client.mutate<
      AddUserConfirmationMutation,
      AddUserConfirmationMutationVariables
    >({
      mutation: ADD_USER_CONFIRMATION,
      variables: {
        addUserConfirmationObject: {
          expires_at: dayjs().add(1, "week"),
          user_id: newUserId,
          token: confirmationToken,
        },
      },
    });
  } catch (error) {
    errorResponseHandler(error, "Failed add user confirmation");

    await client.mutate({
      mutation: DELETE_USER,
      variables: {
        whereDeleteUser: {
          id: { _eq: newUserId },
        },
      },
    });
    throw new Error("Failed add user confirmation");
  }
};

const sendEmail = async (
  requestData: NCreateUser.IRequest["body"],
  confirmationToken: string
) => {
  try {
    const emailLink = `${getBaseUrl()}/${
      requestData.language
    }/confirm-email?token=${confirmationToken}`;

    await transporter.sendMail({
      from: `UAB Baltic <${process.env.EMAIL_USERNAME}>`,
      to: requestData.formData.email,
      subject: "UABBaltic email confirmation",
      html: `<div>
            <a href=${emailLink}>Confirm Email</a>
            </div>`,
    });
  } catch (error) {
    errorResponseHandler(error, "Failed Send Email");
    throw new Error("Failed Send Email");
  }
};

export const POST = async (req: CustomNextApiRequest) => {
  try {
    const requestData: NCreateUser.IRequest["body"] = await req.json();
    const newUserId = await createUser(requestData);
    const confirmationToken = generateToken();
    await addUserConfirmation(newUserId, confirmationToken);
    await sendEmail(requestData, confirmationToken);

    return NextResponse.json(
      { message: "User created successfully" },
      { status: StatusCodes.okStatus }
    );
  } catch (error) {
    return errorResponseHandler(error, "Failed Create User POST");
  }
};

export namespace NCreateUser {
  export interface IRequest {
    body: {
      formData: IPageRegisterInputs;
      language: string;
    };
  }
  export interface IResponse {}
}
