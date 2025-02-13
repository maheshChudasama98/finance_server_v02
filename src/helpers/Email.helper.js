require('dotenv').config();
const nodemailer = require("nodemailer");

const logo = `
<div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
    <div style="display:flex">
        <div>
            <img  src='https://images.unsplash.com/photo-1601158935942-52255782d322?q=80&w=1936&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' weight="200px" height="150px"> </img>
        </div>
    <div style="margin-left: 15px; padding-left : 15px ; border-left: 1px solid #eee;">
        <p>${process.env.PROJECT_NAME}</p>
        <p>${process.env.PROJECT_OTHER}</p>
        <p>${process.env.PROJECT_ADDRESS}</p>
    </div>
    </div>
</div>`


const footer =
    `<table border="0" cellpadding="0" cellspacing="0" width="100%" margin-tob :10px; class="wrapperFooter">
  <tbody>
    <tr>
      <td align="center" valign="top">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="footer">
          <tbody>
            <tr>
              <td style="padding-top:10px;padding-bottom:10px;padding-left:10px;padding-right:10px" align="center"
                valign="top" class="socialLinks">
                <a href="${process.env.FACEBOOK_LINK}" style="display:inline-block" target="_blank" class="facebook">
                  <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/social/light/facebook.png" style="height:auto;width:100%;max-width:40px;margin-left:2px;margin-right:2px" width="40">
                </a>
                <a href="${process.env.TWITTER_LINK}" style="display: inline-block;" target="_blank" class="twitter">
                  <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/social/light/twitter.png" style="height:auto;width:100%;max-width:40px;margin-left:2px;margin-right:2px" width="40">
                </a>
                <a href="${process.env.INSTAGARM_LINK}" style="display: inline-block;" target="_blank"
                  class="instagram">
                  <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/social/light/instagram.png" style="height:auto;width:100%;max-width:40px;margin-left:2px;margin-right:2px" width="40">
                </a>
                <a href="${process.env.LINKDIN_LINK}" style="display: inline-block;" target="_blank" class="linkdin">
                  <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/social/light/linkdin.png" style="height:auto;width:100%;max-width:40px;margin-left:2px;margin-right:2px" width="40">
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 10px 5px;" align="center" valign="top" class="brandInfo">
                <p class="text"
                  style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0">
                  ©&nbsp;${process.env.ADDRESS}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 0px 10px 10px;" align="center" valign="top" class="footerEmailInfo">
                <p class="text"
                  style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0">
                  If you have any quetions please contact us <a href="#" style="color:#bbb;text-decoration:underline"
                    target="_blank">${process.env.MAIN_USER_EMAIL}</a>
                  <br> <a href="${process.env.WEB_LINK}" style="color:#bbb;text-decoration:underline"
                    target="_blank">maheshChudasama.com</a>
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr>
      <td style="font-size:1px;line-height:1px" height="30">&nbsp;</td>
    </tr>
  </tbody>
</table>`

const Box = `
<div style="background-color: #f5f5f5; width : 100%; >
    <table border="0" cellpadding="0" cellspacing="0"  style="max-width:600px ; margin:0 auto">
        <tbody>
            <tr>
                <td align="center" valign="top">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableCard"
                        style="background-color:#fff;border-color:#e5e5e5;border-style:solid;border-width:0 1px 1px 1px;">
                        <tbody>
                            <tr>
                                <td style="background-color:#00a76f;font-size:1px;line-height:3px" class="topBorder"
                                    height="3">&nbsp;</td>
                            </tr>

                            <tr>
                                <td style=" padding-top: 60px; padding-bottom: 5px; padding-left: 20px; padding-right: 20px;"
                                    align="center" valign="top" class="mainTitle">
                                    <h2 class="text"
                                        style="color:#000;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:28px;font-weight:500;font-style:normal;letter-spacing:normal;line-height:36px;text-transform:none;text-align:center;padding:0;margin:0">
                                        Hi "John Doe"</h2>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-bottom: 30px;  padding-left: 20px; padding-right: 20px;"
                                    align="center" valign="top" class="subTitle">
                                    <h4 class="text"
                                        style="color:#999;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:16px;font-weight:500;font-style:normal;letter-spacing:normal;line-height:24px;text-transform:none;text-align:center;padding:0;margin:0">
                                        Verify Your Email Account</h4>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-left:20px;padding-right:20px" align="center" valign="top"
                                    class="containtTable ui-sortable">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%"
                                        class="tableDescription" style="">
                                        <tbody>
                                            <tr>
                                                <td style="padding-bottom: 20px;" align="center" valign="top"
                                                    class="description">
                                                    <p class="text"
                                                        style="color:#666;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:14px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:22px;text-transform:none;text-align:center;padding:0;margin:0">
                                                        Thanks for subscribe for the Vespro newsletter. Please click
                                                        confirm
                                                        button for subscription to start receiving our emails.</p>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableButton"
                                        style="padding-bottom: 50px;">
                                        <tbody>
                                            <tr>
                                                <td style="padding-top:20px;padding-bottom:20px" align="center"
                                                    valign="top">
                                                    <table border="0" cellpadding="0" cellspacing="0" align="center">
                                                        <tbody>
                                                            <tr>
                                                                <td style="background-color: #00a76f; padding: 12px 35px; border-radius: 50px;"
                                                                    align="center" class="ctaButton"> <a href="#"
                                                                        style="color:#fff;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;font-style:normal;letter-spacing:1px;line-height:20px;text-transform:uppercase;text-decoration:none;display:block"
                                                                        target="_blank" class="text">Confirm Email</a>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
</div>
`
const emailSendHelper = async (emailMessage) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        const info = await transporter.sendMail(emailMessage);
        return info.response;
    } catch (error) {
        console.log(`At email send error :- ${error}`);
        throw error;
    }
}

const emailForgetPasswordSendOTP = async (details) => {
    try {
        const emailMessage = {
            from: `${process.env.PROJECT_NAME} <${process.env.EMAIL_USER}>`,
            to: `${details.to}`,
            subject: `Forgot Password`,
            html: `
        <div style="background-color: #f5f5f5; margin-ton: 10px ; width : 100%; >
        <table border="0" cellpadding="0" cellspacing="0"  style="max-width:600px ; margin:0 auto">
            <tbody>
                <tr>
                    <td align="center" valign="top">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableCard"
                            style="background-color:#fff;border-color:#e5e5e5;border-style:solid;border-width:0 1px 1px 1px;">
                            <tbody>
                                <tr>
                                    <td style="background-color:${process.env.PROJECT_THEME_COLOR};font-size:1px;line-height:3px" class="topBorder"
                                        height="3">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style=" padding-top: 60px; padding-bottom: 5px; padding-left: 20px; padding-right: 20px;"
                                        align="center" valign="top" class="mainTitle">
                                        <h2 class="text"
                                            style="color:#000;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:28px;font-weight:500;font-style:normal;letter-spacing:normal;line-height:36px;text-transform:none;text-align:center;padding:0;margin:0">
                                            Dear  ${details.firstName} ${details?.lastName} </h2>
                                    </td >
                                </tr >
                                <tr>
                                    <td style="padding-bottom: 30px;  padding-left: 20px; padding-right: 20px;"
                                        align="center" valign="top" class="subTitle">
                                        <h4 class="text"
                                            style="color:#999;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:16px;font-weight:500;font-style:normal;letter-spacing:normal;line-height:24px;text-transform:none;text-align:center;padding:0;margin:0">
                                    OTP Verification </h4>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-left:20px;padding-right:20px" align="center" valign="top"
                                        class="containtTable ui-sortable">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%"
                                            class="tableDescription" style="">
                                            <tbody>
                                                <tr>
                                                    <td style="padding-bottom: 20px;" align="center" valign="top"
                                                        class="description">
                                                        <p class="text"
                                                            style="color:#666;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:14px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:22px;text-transform:none;text-align:center;padding:0;margin:0">
                                                            This OTP is valid for the next 15 minutes. If you did not request a password reset, please ignore this email.</p>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableButton"
                                            style="padding-bottom: 50px;">
                                            <tbody>
                                                <tr>
                                                    <td style="padding-top:20px;padding-bottom:20px" align="center"
                                                        valign="top">
                                                        <table border="0" cellpadding="0" cellspacing="0" align="center">
                                                            <tbody>
                                                                <tr>
                                                                    <td style="background-color: ${process.env.PROJECT_THEME_COLOR}; padding: 12px 35px; border-radius: 50px;"
                                                                        align="center" class="ctaButton"> <a href="#"
                                                                            style="color:#fff;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;font-style:normal;letter-spacing:1px;line-height:20px;text-transform:uppercase;text-decoration:none;display:block"
                                                                            target="_blank" class="text">${details?.optNumber}</a>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody >
                        </table >
                    </td >
                </tr >
            </tbody >
        </table >
        </div >
`
        };
        const response = await emailSendHelper(emailMessage);
        return response;
    } catch (error) {
        throw error;
    }
}

const emailFormat = async (details) => {
    try {
        const emailMessage = {
            from: 'Kuvadva Transformer',
            to: `${details.to}`,
            subject: details?.subject,
            html: `
            <div style="background-color: #fff; margin-ton: 10px ; width : 100%;" >
            <div style="max-width:600px ; margin:0 auto; border-color:#e5e5e5; border-style :solid ; border-width :0 1px 1px 1px;">
            <div style="background-color: #03a3ff ;font-size:1px;height:3px"> </div>
            <div style="margin:50px 20px 50px 20px">
                ${details.description}
            </div>
            </div>
            </div>
            `
        };
        const response = await emailSendHelper(emailMessage);
        return response;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    emailSendHelper,
    emailFormat,
    emailForgetPasswordSendOTP
}