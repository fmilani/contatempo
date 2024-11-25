import Duration, { calculateDuration } from "@/components/Duration"
import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components"
import formatInTimeZone from "date-fns-tz/formatInTimeZone"
import zonedTimeToUtc from "date-fns-tz/zonedTimeToUtc"
import * as React from "react"

interface RecordsReportEmailProps {
  username: string
  period: { from: string; to: string }
  records: any[]
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000"

export const RecordsReportEmail = ({
  username,
  period,
  records,
}: RecordsReportEmailProps) => {
  const duration = calculateDuration(records, new Date())
  const recordedTime = `${duration.hours} hours, ${duration.minutes} minutes and ${duration.seconds} seconds`
  return (
    <Html>
      <Head />
      <Preview>How much you've recorded</Preview>
      <Body style={main}>
        <Container>
          <Section style={logo}>
            {/* <Img src={`${baseUrl}/static/contatempo-logo.png`} /> */}
            <Text style={{ fontSize: 28 }}>contatempo</Text>
          </Section>

          <Section style={content}>
            {/* <Row> */}
            {/*   <Img */}
            {/*     style={image} */}
            {/*     width={620} */}
            {/*     src={`${baseUrl}/static/contatempo-header.png`} */}
            {/*   /> */}
            {/* </Row> */}

            <Row style={{ ...boxInfos, paddingBottom: "0" }}>
              <Column>
                <Heading
                  style={{
                    fontSize: 32,
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Records report
                </Heading>
                <Heading
                  as="h2"
                  style={{
                    fontSize: 26,
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  {new Intl.DateTimeFormat().format(
                    zonedTimeToUtc(
                      `${period.from} 00:00:00`,
                      "America/Sao_Paulo",
                    ),
                  )}{" "}
                  -{" "}
                  {new Intl.DateTimeFormat().format(
                    zonedTimeToUtc(
                      `${period.to} 23:59:59`,
                      "America/Sao_Paulo",
                    ),
                  )}
                </Heading>
                <Heading
                  as="h3"
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  {username}
                </Heading>

                <Text style={{ ...paragraph }}>
                  <b>Recorded time: </b>
                  {recordedTime}
                </Text>

                <Text style={{ ...paragraph, marginTop: -5 }}>
                  Below are the details of each record in the period.
                </Text>
              </Column>
            </Row>
            <div
              style={{
                ...boxInfos,
                paddingTop: "0",
                padding: 20,
                lineHeight: 1.5,
              }}
            >
              <Row>
                <Column style={recordColumnHeader}>From</Column>
                <Column style={recordColumnHeader}>To</Column>
                <Column style={{ ...recordColumnHeader, textAlign: "right" }}>
                  Total
                </Column>
              </Row>
              {records.map((record) => {
                return (
                  <Row key={record.id}>
                    <Column style={recordColumn}>
                      {formatInTimeZone(
                        new Date(record.begin),
                        "America/Sao_Paulo",
                        "MM/dd HH:mm",
                      )}
                    </Column>
                    <Column style={recordColumn}>
                      {formatInTimeZone(
                        new Date(record.end),
                        "America/Sao_Paulo",
                        "MM/dd HH:mm",
                      )}
                    </Column>
                    <Column style={{ ...recordColumn, textAlign: "right" }}>
                      <Duration records={[record]} now={new Date()} />
                    </Column>
                  </Row>
                )
              })}
              <Row>
                <Column style={recordColumn}></Column>
                <Column style={recordColumn}></Column>
                <Column
                  style={{
                    ...recordColumn,
                    textAlign: "right",
                    fontWeight: "bold",
                  }}
                >
                  --------
                </Column>
              </Row>
              <Row>
                <Column style={recordColumn}></Column>
                <Column style={recordColumn}></Column>
                <Column
                  style={{
                    ...recordColumn,
                    textAlign: "right",
                    fontWeight: "bold",
                  }}
                >
                  <Duration records={records} now={new Date()} />
                </Column>
              </Row>
            </div>
            <Row style={{ ...boxInfos, paddingTop: "0" }}>
              <Column style={containerButton} colSpan={2}>
                <Button
                  style={button}
                  href={`${baseUrl}/records?from=${period.from}&to=${period.to}`}
                >
                  Check on the app
                </Button>
              </Column>
            </Row>
          </Section>

          {/* <Section style={containerImageFooter}> */}
          {/*   <Img */}
          {/*     style={image} */}
          {/*     width={620} */}
          {/*     src={`${baseUrl}/static/contatempo-footer.png`} */}
          {/*   /> */}
          {/* </Section> */}

          <Text
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "rgb(0,0,0, 0.7)",
            }}
          >
            © 2024 | contatempo, Brazil. | www.contatempo.app
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const previewRecords = [
  {
    begin: new Date("2024-11-30T02:00:27Z"),
    end: new Date("2024-11-30T04:14:00Z"),
  },
  {
    begin: new Date("2024-12-11T13:14:15Z"),
    end: new Date("2024-12-11T21:00:08Z"),
  },
  {
    begin: new Date("2024-12-16T01:00:00Z"),
    end: new Date("2024-12-16T02:00:01Z"),
  },
]
RecordsReportEmail.PreviewProps = {
  username: "Felipe Milani",
  period: { from: "2024-11-29", to: "2024-12-15" },
  records: previewRecords,
} as RecordsReportEmailProps

export default RecordsReportEmail

const main = {
  backgroundColor: "#fff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const paragraph = {
  fontSize: 16,
}

const logo = {
  fontSize: 48,
  padding: "20px",
}

const containerButton = {
  display: "flex",
  justifyContent: "center",
  width: "100%",
}

const button = {
  backgroundColor: "#000000",
  borderRadius: 3,
  color: "#FFF",
  fontWeight: "bold",
  border: "1px solid rgb(0,0,0, 0.1)",
  cursor: "pointer",
  padding: "12px 30px",
}

const content = {
  border: "1px solid rgb(0,0,0, 0.1)",
  borderRadius: "3px",
  overflow: "hidden",
}

const image = {
  maxWidth: "100%",
}

const boxInfos = {
  padding: "20px",
}

const containerImageFooter = {
  padding: "45px 0 0 0",
}

const recordColumn = {
  width: "33%",
}

const recordColumnHeader = {
  ...recordColumn,
  fontWeight: "bold",
}
