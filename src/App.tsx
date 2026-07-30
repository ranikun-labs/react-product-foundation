import { AppLocaleProvider } from '@/i18n/AppLocaleProvider';
import { useTranslation } from '@/i18n/I18nContext';

function Starter() {
  const { t } = useTranslation();
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-3xl font-bold">{t('common.appName')}</h1>
      <p className="text-text-secondary">{t('common.starterReady')}</p>
    </main>
  );
}

export function App() {
  return (
    <AppLocaleProvider>
      <Starter />
    </AppLocaleProvider>
  );
}
