import { NextApiRequest } from "next";
import client from "../../../../apollo-client";
import { NextResponse } from "next/server";
import { StatusCodes } from "@/constants/status-code";
import { GET_USER_PASSWORD_CHANGE_REQUEST } from "@/components/store/modules/user-password-change-request/query";
import dayjs from "dayjs";
import bcrypt from "bcrypt";
import { UPDATE_USERS } from "@/components/store/modules/user/query";

interface CustomNextApiRequest extends NextApiRequest {
  json: () => Promise<NForgotPassword.IRequest["body"]>;
}

export const POST = async (req: CustomNextApiRequest) => {
  const requestData: NForgotPassword.IRequest["body"] = await req.json();
  const saltRounds = 10;

  bcrypt.genSalt(saltRounds, function (error, salt: string) {
    bcrypt.hash(
      requestData.password,
      salt,
      async function (error, hash: string) {
        const userId = await client
          .query({
            query: GET_USER_PASSWORD_CHANGE_REQUEST,
            variables: {
              whereUserPasswordChangeRequest: {
                token: { _eq: requestData.token },
                expires_at: { _gte: dayjs().format() },
              },
            },
          })
          .then((val) => val.data.user_password_change_request?.[0]?.user?.id)
          .catch((error) => {
            console.error("GET_USER_PASSWORD_CHANGE_REQUEST >", error);
            return NextResponse.json(
              { message: "Internal server error" },
              { status: StatusCodes.internalServerError }
            );
          });
        const test = await client
          .mutate({
            mutation: UPDATE_USERS,
            variables: {
              whereUpdateUsers: {
                id: { _eq: userId },
              },
              setUpdateUsers: {
                password: hash,
              },
            },
          })
          .catch((error) => {
            console.error("UPDATE_USERS >", error);
            return NextResponse.json(
              { message: "Internal server error" },
              { status: StatusCodes.internalServerError }
            );
          });
      }
    );
  });

  return NextResponse.json(
    { message: "Reset password" },
    { status: StatusCodes.okStatus }
  );
};

export namespace NForgotPassword {
  export interface IRequest {
    body: {
      token: string;
      password: string;
    };
  }
  export interface IResponse {}
}
