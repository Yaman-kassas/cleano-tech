import { genders } from '@/data';
import { Group, Radio } from '@mantine/core';
import classes from './styles.module.scss';
import useTranslation from 'next-translate/useTranslation';

type RadioInputProps = {
  onChange?: (value: 'male' | 'female' | "Don'tDeclare" | null) => void;
  value?: 'male' | 'female' | "Don'tDeclare" | null;
  error?: string;
};

export default function RadioInput({
  value,
  onChange,
  error,
}: RadioInputProps) {
  const { t } = useTranslation();

  return (
    <Radio.Group
      label={t('common:Wher')}
      classNames={{ label: classes.radioGroupLabel }}
      value={value || ''}
      onChange={(v: string) => {
        if (onChange) onChange(v as 'male' | 'female' | "Don'tDeclare");
      }}
      error={error}
    >
      <Group justify="space-between">
        {genders.map((v) => (
          <Radio
            label={t(`common:${v.label}`)}
            key={v.label}
            p={8}
            c="#4985BB"
            value={v.value}
            classNames={{
              label: classes.label,
              radio: classes.radio,
              inner: classes.inner,
            }}
          />
        ))}
      </Group>
    </Radio.Group>
  );
}

RadioInput.defaultProps = {
  value: null,
};
