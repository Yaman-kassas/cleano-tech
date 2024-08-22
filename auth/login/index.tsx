import Layout from '@/components/layout/layout';
import { Flex } from '@mantine/core';

import {
  LoginForm,
  SharedContentContainer,
} from '@/components/auth-pages-components';

export default function Login() {
  return (
    <Layout authPages>
      <Flex justify="center" align="center">
        <SharedContentContainer login image="/images/login-pic.webp">
          <LoginForm />
        </SharedContentContainer>
      </Flex>
    </Layout>
  );
}
