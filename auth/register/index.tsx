import Layout from '@/components/layout/layout';
import { Flex } from '@mantine/core';
import {
  SharedContentContainer,
  SignUpForm,
} from '@/components/auth-pages-components';

export default function Register() {
  return (
    <Layout homePge={false} authPages>
      <Flex justify="center" align="center">
        <SharedContentContainer signUp image="/images/login-pic.webp">
          <SignUpForm />
        </SharedContentContainer>
      </Flex>
    </Layout>
  );
}
