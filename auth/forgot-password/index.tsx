import {
  ForgotPassForm,
  SharedContentContainer,
} from '@/components/auth-pages-components';
import Layout from '@/components/layout/layout';
import { Flex } from '@mantine/core';

export default function ForgetPassword() {
  return (
    <Layout homePge={false} authPages>
      <Flex justify="center" align="center">
        <SharedContentContainer forgotPass image="/images/verify-email.webp">
          <ForgotPassForm />
        </SharedContentContainer>
      </Flex>
    </Layout>
  );
}
