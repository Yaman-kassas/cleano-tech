import { parseMultipartData } from "@strapi/utils";
import nodemailer from "nodemailer";
import dayjs from "dayjs";
import { config } from "process";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import verfiy from "../services/verfiy";
import { Context } from "koa";
import getLogo from "../../api/order/functions/getLogo";
import transporter from "../../../utils/transporter";
import axios from "axios";
import translate from "../../../utils/translation";
//
// const sanitizeOutput = async (user, ctx) => {
//   const { auth } = ctx.state;
//   const userModel = await strapi.getModel("plugin::users-permissions.user");
//   return await sanitize.contentAPI.output(user, userModel, ctx);
// };
export default (plugin) => {
  plugin.controllers.user.createme = async (ctx: Context) => {
    try {
      const code = Math.floor(100000 + Math.random() * 900000);
      const data = parseMultipartData(ctx).data.data;
      data.email = data.email.toLowerCase();
      const userExist = await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          filters: {
            email: data.email,
          },
        }
      );
      console.log(userExist);
      if ((userExist.length as any) > 0) ctx.throw(400, "User already exist");

      const user = await strapi.entityService.create(
        "plugin::users-permissions.user",
        {
          data: {
            email: data.email,
            username: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
            password: data.password,
            provider: "local",
            confirmed: false,
            blocked: false,
            address: data.address,
            gender: data.gender,
            phone: data.phone,
            verification_code: code,
            code_expire: dayjs().add(30, "m").toDate(),
            role: 2,
          },
        }
      );

      const id = user.id;
      const link =
        process.env.FRONT_END_LINK +
        `/auth/confirm-email?email=${user.email}&&code=${code}`;
      // user.jwt = await strapi
      //   .service("plugin::users-permissions.jwt")
      //   .issue({ id });
      const codeDigits = ("" + code).split("");
      const language = ctx.headers["locale"];
      const confirmLabel = await translate.t(language, "confirm");
      const sectionOne = await translate.t(
        language,
        "confirm_email_section_one"
      );
      const sectionTwo = await translate.t(
        language,
        "confirm_email_section_two"
      );
      const title = await translate.t(language, "confirm_email_title");
      const subTitle = await translate.t(language, "confirm_email_subtitle");
      const footerTitle = await translate.t(
        language,
        "confirm_email_footer_title"
      );
      const footerSubtitle = await translate.t(
        language,
        "confirm_email_footer_subtitle"
      );
      const { phone_number } = await strapi.entityService.findMany(
        "api::media.media",
        {
          fields: ["phone_number"],
        }
      );
      const media = await strapi.entityService.findMany("api::media.media", {
        populate: ["social_media_links", "logo"],
      });
      console.log(media);

      const { data: data2 } = await axios.post(
        "https://api.templid.com/v1/templates/139/send/16",

        {
          from: {
            email: "support@cleanotech.de",
            name: "cleanotech team",
          },
          to: [
            {
              email: user.email,
              name: `${user.first_name} ${user.last_name}`,
              variables: {
                data: {
                  one: codeDigits[0],
                  two: codeDigits[1],
                  three: codeDigits[2],
                  four: codeDigits[3],
                  five: codeDigits[4],
                  six: codeDigits[5],
                  name: user.first_name,
                },
                content: {
                  sectionOne: sectionOne,
                  sectionTwo: sectionTwo,
                  title: title,
                  subtitle: subTitle,
                  footerTitle: footerTitle,
                  footerSubtitle: footerSubtitle,
                  confirmLabel: confirmLabel,
                  phoneNumber: phone_number,
                  socialMediaLinks: {
                    ...media.social_media_links,
                  },
                  logo: media.logo.url,
                  link: link,
                },
              },
            },
          ],
        },
        {
          headers: {
            "Content-type": "application/json",

            Authorization:
              "Bearer 55|MfYPLYLgTJ0Fwg08hivuusUpA70zxWKpx7ov18ee6fe523e8",
          },
        }
      );
      console.log(data2);

      return user;
    } catch (err) {
      ctx.throw(err);
    }
  };
  plugin.controllers.user.confirm = async (ctx) => {
    const data = parseMultipartData(ctx).data.data;
    data.email = data.email.toLowerCase();

    const result = await verfiy.verfiy(data);
    if (result.status !== 200) ctx.throw(result.status, result.message);
    const updatedUser = await strapi.entityService.update<any, any>(
      "plugin::users-permissions.user",
      result.user[0].id,
      {
        data: {
          confirmed: true,
          verification_code: null,
        },
      }
    );

    return updatedUser;
  };
  plugin.controllers.user.reSendCode = async (ctx: Context) => {
    try {
      const data = parseMultipartData(ctx).data.data;

      if (!data.email) ctx.throw(400, "Email is required");
      if (!data.type) ctx.throw(400, "Type of code must be declared");
      data.email = data.email.toLowerCase();

      const code = Math.floor(100000 + Math.random() * 900000);
      const language = ctx.headers["locale"];

      const user = await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          filters: {
            email: data.email,
          },
        }
      );
      if (user.length === 0) ctx.throw(400, "User not found");
      const updatedUser = await strapi.entityService.update(
        "plugin::users-permissions.user",
        user[0].id,
        {
          data: {
            verification_code: code,
            code_expire: dayjs().add(30, "m").toDate(),
          },
        }
      );
      const media = await strapi.entityService.findMany("api::media.media", {
        populate: ["social_media_links", "logo"],
      });
      const codeDigits = ("" + code).split("");
      let link;

      if (data.type === "register") {
        link =
          process.env.FRONT_END_LINK +
          `/auth/confirm-email?email=${user[0].email}&&code=${code}`;
        const sectionOne = await translate.t(
          language,
          "confirm_email_section_one"
        );
        const sectionTwo = await translate.t(
          language,
          "confirm_email_section_two"
        );
        const title = await translate.t(language, "confirm_email_title");
        const subTitle = await translate.t(language, "confirm_email_subtitle");
        const footerTitle = await translate.t(
          language,
          "confirm_email_footer_title"
        );
        const footerSubtitle = await translate.t(
          language,
          "confirm_email_footer_subtitle"
        );
        const confirmLabel = await translate.t(language, "confirm");
        const { data: data2 } = await axios.post(
          "https://api.templid.com/v1/templates/139/send/16",

          {
            from: {
              email: "support@cleanotech.de",
              name: "cleanotech team",
            },
            to: [
              {
                email: updatedUser.email,
                name: `${updatedUser.first_name} ${updatedUser.last_name}`,
                variables: {
                  data: {
                    one: codeDigits[0],
                    two: codeDigits[1],
                    three: codeDigits[2],
                    four: codeDigits[3],
                    five: codeDigits[4],
                    six: codeDigits[5],
                    name: updatedUser.first_name,
                  },
                  content: {
                    sectionOne: sectionOne,
                    sectionTwo: sectionTwo,
                    title: title,
                    subtitle: subTitle,
                    footerTitle: footerTitle,
                    footerSubtitle: footerSubtitle,
                    confirmLabel: confirmLabel,
                    phoneNumber: media.phone_number,
                    socialMediaLinks: {
                      ...media.social_media_links,
                    },
                    logo: media.logo.url,
                    link: link,
                  },
                },
              },
            ],
          },
          {
            headers: {
              "Content-type": "application/json",

              Authorization:
                "Bearer 55|MfYPLYLgTJ0Fwg08hivuusUpA70zxWKpx7ov18ee6fe523e8",
            },
          }
        );
      }

      if (data.type === "reset-password") {
        link =
          process.env.FRONT_END_LINK +
          `/auth/confirm-reset?email=${user[0].email}&&code=${code}`;
        console.log(codeDigits);
        console.log(link);
        const title = await translate.t(language, "reset_password_title");
        const sectionOne = await translate.t(
          language,
          "reset_password_section_one"
        );
        const sectionTwo = await translate.t(
          language,
          "reset_password_section_two"
        );
        const footerTitle = await translate.t(
          language,
          "reset_password_footer_title"
        );
        const footerSubtitle = await translate.t(
          language,
          "reset_password_footer_subtitle"
        );
        const resetLabel = await translate.t(language, "reset");
        const { data: data2 } = await axios.post(
          "https://api.templid.com/v1/templates/140/send/16",

          {
            from: {
              email: "support@cleanotech.de",
              name: "cleanotech team",
            },
            to: [
              {
                email: updatedUser.email,
                name: `${updatedUser.first_name} ${updatedUser.last_name}`,
                variables: {
                  data: {
                    one: codeDigits[0],
                    two: codeDigits[1],
                    three: codeDigits[2],
                    four: codeDigits[3],
                    five: codeDigits[4],
                    six: codeDigits[5],
                    name: updatedUser.first_name,
                  },
                  content: {
                    sectionOne: sectionOne,
                    sectionTwo: sectionTwo,
                    title: title,
                    footerTitle: footerTitle,
                    footerSubtitle: footerSubtitle,
                    phoneNumber: media.phone_number,
                    resetLabel: resetLabel,
                    socialMediaLinks: {
                      ...media.social_media_links,
                    },
                    logo: media.logo.url,
                    link: link,
                  },
                },
              },
            ],
          },
          {
            headers: {
              "Content-type": "application/json",

              Authorization:
                "Bearer 55|MfYPLYLgTJ0Fwg08hivuusUpA70zxWKpx7ov18ee6fe523e8",
            },
          }
        );
      }
      return {
        data: {
          status: 200,
          message: "The code has been sent successfully",
        },
      };
    } catch (err) {
      ctx.throw(err);
    }
  };
  plugin.controllers.user.login = async (ctx) => {
    const data = parseMultipartData(ctx).data.data;
    data.identifier = data.identifier.toLowerCase();

    const identifier = data.identifier;
    const password = data.password;
    if (!identifier || !password) ctx.throw(400, "invalid credentials");

    const user = await strapi.entityService.findMany(
      "plugin::users-permissions.user",
      {
        filters: {
          email: identifier,
        },
      }
    );

    if (user.length === 0) ctx.throw(404, "User not found");
    const confirmed = user[0].confirmed;

    if (!confirmed) ctx.throw(400, "Email is not confirmed");
    const confirmPassword = await bcrypt.compare(password, user[0].password);

    if (!confirmPassword) ctx.throw(400, "Invalid password");
    const updatedUser = await strapi.entityService.update<any, any>(
      "plugin::users-permissions.user",
      user[0].id,
      {
        data: {
          role: 1,
        },
      }
    );
    const id = user[0].id;
    updatedUser.jwt = await strapi
      .service("plugin::users-permissions.jwt")
      .issue({ id });
    return updatedUser;
  };
  plugin.controllers.user.confirmResetPasswordCode = async (ctx) => {
    const data = parseMultipartData(ctx).data.data;
    data.email = data.email.toLowerCase();

    const result = await verfiy.verfiy(data);
    if (result.status !== 200) ctx.throw(result.status, result.message);
    return {
      data: {
        status: result.status,
        message: "code verified successfully",
      },
    };
  };
  plugin.controllers.user.resetPassword = async (ctx: Context) => {
    const data = parseMultipartData(ctx).data.data;
    if (!data.password || !data.email || !data.verification_code)
      ctx.throw(400, "Invalid credential");
    data.email = data.email.toLowerCase();

    const result = await verfiy.verfiy(data);
    if (result.status !== 200) ctx.throw(result.status, result.message);

    const user = await strapi.entityService.findMany(
      "plugin::users-permissions.user",
      {
        filters: {
          email: data.email,
        },
      }
    );
    if ((user.length as any) < 0) ctx.throw(400, "Invalid email");

    const id = user[0].id;

    const updatedUser = await strapi.plugins[
      "users-permissions"
    ].services.user.edit(id, {
      password: data.password,
      verification_code: null,
    });
    return updatedUser;
  };

  plugin.routes["content-api"].routes.push(
    {
      method: "POST",
      path: "/auth/local/registerme",
      handler: "user.createme",
      config: {
        prefix: "",
      },
    },
    {
      method: "POST",
      path: "/auth/confirm",
      handler: "user.confirm",
      config: {
        prefix: "",
      },
    },
    {
      method: "POST",
      path: "/auth/login",
      handler: "user.login",
      config: {
        prefix: "",
      },
    },
    {
      method: "POST",
      path: "/auth/resend",
      handler: "user.reSendCode",
      config: {
        prefix: "",
      },
    },
    {
      method: "POST",
      path: "/auth/resetpassword",
      handler: "user.resetPassword",
      config: {
        prefix: "",
      },
    },
    {
      method: "POST",
      path: "/auth/confirm_reset_password",
      handler: "user.confirmResetPasswordCode",
      config: {
        prefix: "",
      },
    }
  );
  return plugin;
};
