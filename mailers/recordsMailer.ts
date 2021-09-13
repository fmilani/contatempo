/* TODO - You need to add a mailer integration in `integrations/` and import here.
 *
 * The integration file can be very simple. Instantiate the email client
 * and then export it. That way you can import here and anywhere else
 * and use it straight away.
 */
import { Record } from "db"
import previewEmail from "preview-email"

type RecordsMailer = {
  to: string
  startDate: Date
  endDate: Date
  records: Record[]
}

export function recordsMailer({ to, startDate, endDate, records }: RecordsMailer) {
  const msg = {
    from: "contatempo@contatempo.com",
    to,
    subject: "Your Contatempo records",
    html: `
      <h3>Records</h3>
      <h5>From: ${startDate}</h5>
      <h5>To: ${endDate}</h5>
      <ul>
        ${records.map((record) => `<li>${record.begin} - ${record.end}</li>`).join("\n")}
      </ul>
    `,
  }

  return {
    async send() {
      if (process.env.NODE_ENV === "production") {
        // TODO - send the production email, like this:
        // await postmark.sendEmail(msg)
        throw new Error("No production email implementation in mailers/forgotPasswordMailer")
      } else {
        // Preview email in the browser
        await previewEmail(msg)
      }
    },
  }
}
