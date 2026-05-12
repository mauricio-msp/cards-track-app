import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'

interface VerifyEmailProps {
  verifyUrl: string
  userName: string
}

export function VerifyEmail(props: VerifyEmailProps) {
  const { userName, verifyUrl } = props

  const currentYear = new Date().getFullYear()

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Please verify your email address to complete your registration</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white rounded-[8px] px-[32px] py-[40px] mx-auto w-[600px]">
            <Section>
              <Heading className="text-[32px] font-bold text-gray-900 text-center mb-[32px]">
                Verify Your Email Address
              </Heading>

              <Text className="text-[16px] text-gray-700 mb-[24px]">Hi there!</Text>

              <Text className="text-[16px] text-gray-700 mb-[24px]">
                Thanks {userName} for signing up! To complete your registration and start using your
                account, please verify your email address by clicking the button below.
              </Text>

              <Section className="text-center mb-[32px]">
                <Button
                  href={verifyUrl}
                  className="bg-blue-600 text-white px-[32px] py-[12px] rounded-[8px] text-[16px] font-semibold no-underline box-border"
                >
                  Verify Email Address
                </Button>
              </Section>

              <Text className="text-[14px] text-gray-600 mb-[24px]">
                If the button doesn't work, you can copy and paste this link into your browser:
              </Text>

              <Text className="text-[14px] text-blue-600 mb-[32px] break-all">{verifyUrl}</Text>

              <Text className="text-[14px] text-gray-600 mb-[8px]">
                This verification link will expire in 24 hours for security reasons.
              </Text>

              <Text className="text-[14px] text-gray-600">
                If you didn't create an account, you can safely ignore this email.
              </Text>
            </Section>

            <Section className="border-t border-gray-200 pt-[24px] mt-[40px]">
              <Text className="text-[12px] text-gray-500 text-center m-0">
                © {currentYear} Cards·Track Inc. All rights reserved.
              </Text>
              <Text className="text-[12px] text-gray-500 text-center m-0">
                Cascavel, CE 62850-000
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
